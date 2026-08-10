import axios from "axios";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../auth/context/useAuth";

import {
  createAcademicRecord,
  getAcademicRecords,
  getCurriculumSubjects,
  updateAcademicRecord,
} from "../services/academicRecordManagementService";

import { getAdminStudents } from "../services/studentManagementService";

import type {
  AcademicRecord,
  AcademicRecordFormState,
  CreateAcademicRecordPayload,
  CurriculumSubject,
  SubjectAcademicRecordFormState,
  SubjectFormErrors,
  SubjectScoreField,
} from "../types/academicRecordManagement";

import type { AdminStudent } from "../types/studentManagement";


const PAGE_SIZE = 10;


const emptyForm: AcademicRecordFormState = {
  studentId: "",
  previousGpa: "",
  semester: "",
  gender: "",
};


function AdminAcademicRecordsPage() {
  const { token } = useAuth();

  const [records, setRecords] =
    useState<AcademicRecord[]>([]);

  const [students, setStudents] =
    useState<AdminStudent[]>([]);

  const [editingRecord, setEditingRecord] =
    useState<AcademicRecord | null>(null);

  const [searchInput, setSearchInput] =
    useState("");

  const [semesterFilter, setSemesterFilter] =
    useState("");

  const [genderFilter, setGenderFilter] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [modalError, setModalError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [form, setForm] =
    useState<AcademicRecordFormState>(
      emptyForm,
    );

  const [formErrors, setFormErrors] =
    useState<
      Partial<
        Record<
          keyof AcademicRecordFormState,
          string
        >
      >
    >({});

  const [subjectForms, setSubjectForms] =
    useState<
      SubjectAcademicRecordFormState[]
    >([]);

  const [subjectErrors, setSubjectErrors] =
    useState<SubjectFormErrors>({});

  const [
    excludedSubjects,
    setExcludedSubjects,
  ] = useState<CurriculumSubject[]>([]);

  const [
    curriculumLoading,
    setCurriculumLoading,
  ] = useState(false);

  const [
    curriculumError,
    setCurriculumError,
  ] = useState("");


  const fetchData = useCallback(
    async () => {
      if (!token) {
        setError(
          "You are not authenticated.",
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [
          academicRecords,
          studentRecords,
        ] = await Promise.all([
          getAcademicRecords(token),

          getAdminStudents(token, {
            skip: 0,
            limit: 1000,
          }),
        ]);

        setRecords(
          [...academicRecords].sort(
            (first, second) =>
              second.id - first.id,
          ),
        );

        setStudents(studentRecords);
      } catch (requestError) {
        console.error(
          "Failed to load academic records:",
          requestError,
        );

        setError(
          getErrorMessage(requestError),
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  );


  /*
   * Initial page loading.
   *
   * We do not directly call fetchData()
   * here because your ESLint setup reports
   * that pattern as set-state-in-effect.
   */
  useEffect(() => {
    if (!token) {
      return;
    }

    const currentToken: string = token;

    let cancelled = false;

    async function loadInitialData() {
      try {
        const [
          academicRecords,
          studentRecords,
        ] = await Promise.all([
          getAcademicRecords(
            currentToken,
          ),

          getAdminStudents(
            currentToken,
            {
              skip: 0,
              limit: 1000,
            },
          ),
        ]);

        if (cancelled) {
          return;
        }

        setRecords(
          [...academicRecords].sort(
            (first, second) =>
              second.id - first.id,
          ),
        );

        setStudents(
          studentRecords,
        );

        setError("");
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load academic records:",
          requestError,
        );

        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [token]);


  const studentsById = useMemo(
    () =>
      new Map(
        students.map(
          (student) => [
            student.id,
            student,
          ],
        ),
      ),
    [students],
  );


  const selectedStudent =
    useMemo(() => {
      if (!form.studentId) {
        return null;
      }

      return (
        studentsById.get(
          Number(form.studentId),
        ) ?? null
      );
    }, [
      form.studentId,
      studentsById,
    ]);


  const selectedDepartment =
    selectedStudent?.department ?? "";


  /*
   * Load subjects whenever Student +
   * Semester are available.
   */
  useEffect(() => {
    if (
      !token ||
      !isModalOpen ||
      !selectedDepartment ||
      !form.semester
    ) {
      return;
    }

    const currentToken: string = token;

    const semester =
      Number(form.semester);

    if (
      !Number.isInteger(semester) ||
      semester < 1 ||
      semester > 8
    ) {
      return;
    }

    const department =
      normalizeDepartmentForCurriculum(
        selectedDepartment,
      );

    let cancelled = false;

    async function loadCurriculum() {
      try {
        const curriculum =
          await getCurriculumSubjects(
            currentToken,
            department,
            semester,
          );

        if (cancelled) {
          return;
        }

        const standardSubjects =
          curriculum.filter(
            (subject) =>
              subject.standard_assessment,
          );

        const nonStandardSubjects =
          curriculum.filter(
            (subject) =>
              !subject.standard_assessment,
          );


        setSubjectForms(
          (currentSubjectForms) =>
            standardSubjects.map(
              (subject) => {
                const existing =
                  currentSubjectForms.find(
                    (currentSubject) =>
                      currentSubject.subjectCode
                        .trim()
                        .toUpperCase() ===
                      subject.code
                        .trim()
                        .toUpperCase(),
                  );

                if (existing) {
                  return {
                    ...existing,
                    subjectCode:
                      subject.code,
                    subjectName:
                      subject.name,
                    credits:
                      subject.credits,
                  };
                }

                return createEmptySubjectForm(
                  subject,
                );
              },
            ),
        );

        setExcludedSubjects(
          nonStandardSubjects,
        );

        setCurriculumError("");
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load curriculum:",
          requestError,
        );

        setSubjectForms([]);
        setExcludedSubjects([]);

        setCurriculumError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        if (!cancelled) {
          setCurriculumLoading(false);
        }
      }
    }

    void loadCurriculum();

    return () => {
      cancelled = true;
    };
  }, [
    token,
    isModalOpen,
    selectedDepartment,
    form.semester,
  ]);


  const filteredRecords =
    useMemo(() => {
      const search =
        searchInput
          .trim()
          .toLowerCase();

      return records.filter(
        (record) => {
          const student =
            studentsById.get(
              record.student_id,
            );

          const matchesSearch =
            !search ||
            Boolean(
              student?.full_name
                .toLowerCase()
                .includes(search),
            ) ||
            Boolean(
              student?.email
                .toLowerCase()
                .includes(search),
            ) ||
            Boolean(
              student?.roll_number
                .toLowerCase()
                .includes(search),
            ) ||
            Boolean(
              student?.department
                .toLowerCase()
                .includes(search),
            ) ||
            String(
              record.student_id,
            ).includes(search);

          const matchesSemester =
            !semesterFilter ||
            record.semester ===
              Number(
                semesterFilter,
              );

          const matchesGender =
            !genderFilter ||
            record.gender
              .toLowerCase() ===
              genderFilter
                .toLowerCase();

          return (
            matchesSearch &&
            matchesSemester &&
            matchesGender
          );
        },
      );
    }, [
      records,
      studentsById,
      searchInput,
      semesterFilter,
      genderFilter,
    ]);


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredRecords.length /
          PAGE_SIZE,
      ),
    );


  /*
   * Derived page prevents us from using
   * setPage inside a useEffect.
   */
  const safePage =
    Math.min(
      page,
      totalPages,
    );


  const paginatedRecords =
    useMemo(() => {
      const start =
        (safePage - 1) *
        PAGE_SIZE;

      return filteredRecords.slice(
        start,
        start + PAGE_SIZE,
      );
    }, [
      filteredRecords,
      safePage,
    ]);


  function openCreateModal() {
    setEditingRecord(null);

    setForm({
      ...emptyForm,
    });

    setSubjectForms([]);
    setSubjectErrors({});
    setExcludedSubjects([]);

    setCurriculumLoading(false);
    setCurriculumError("");

    setFormErrors({});
    setModalError("");

    setIsModalOpen(true);
  }


  function openEditModal(
    record: AcademicRecord,
  ) {
    setEditingRecord(record);

    setForm({
      studentId:
        String(record.student_id),

      previousGpa:
        record.previous_gpa === null
          ? ""
          : String(
              record.previous_gpa,
            ),

      semester:
        String(record.semester),

      gender:
        record.gender,
    });


    const existingSubjects:
      SubjectAcademicRecordFormState[] =
        (
          record.subject_records ??
          []
        ).map(
          (subject) => ({
            subjectCode:
              subject.subject_code,

            subjectName:
              subject.subject_name,

            credits:
              subject.credits,

            attendance:
              String(
                subject.attendance,
              ),

            internalMarks:
              String(
                subject.internal_marks,
              ),

            assignmentScore:
              String(
                subject.assignment_score,
              ),

            quizScore:
              String(
                subject.quiz_score,
              ),
          }),
        );


    setSubjectForms(
      existingSubjects,
    );

    setSubjectErrors({});
    setExcludedSubjects([]);

    setCurriculumError("");

    /*
     * Existing student and semester are
     * already known, therefore curriculum
     * loading will begin immediately.
     */
    setCurriculumLoading(true);

    setFormErrors({});
    setModalError("");

    setIsModalOpen(true);
  }


  function closeModal() {
    if (submitting) {
      return;
    }

    setIsModalOpen(false);

    setEditingRecord(null);

    setForm({
      ...emptyForm,
    });

    setSubjectForms([]);
    setSubjectErrors({});
    setExcludedSubjects([]);

    setCurriculumLoading(false);
    setCurriculumError("");

    setFormErrors({});
    setModalError("");
  }


  function updateFormField(
    field:
      keyof AcademicRecordFormState,
    value: string,
  ) {
    setForm(
      (currentForm) => {
        const updatedForm:
          AcademicRecordFormState = {
            ...currentForm,
            [field]: value,
          };

        /*
         * Semester 1 does not have
         * Previous GPA.
         */
        if (
          field === "semester" &&
          value === "1"
        ) {
          updatedForm.previousGpa =
            "";
        }

        return updatedForm;
      },
    );


    setFormErrors(
      (currentErrors) => {
        const updatedErrors = {
          ...currentErrors,
        };

        delete updatedErrors[field];

        if (
          field === "semester" &&
          value === "1"
        ) {
          delete updatedErrors.previousGpa;
        }

        return updatedErrors;
      },
    );


    /*
     * Changing student or semester means
     * the curriculum must be refreshed.
     */
    if (
      field === "studentId" ||
      field === "semester"
    ) {
      const nextStudentId =
        field === "studentId"
          ? value
          : form.studentId;

      const nextSemester =
        field === "semester"
          ? value
          : form.semester;

      setSubjectForms([]);
      setSubjectErrors({});
      setExcludedSubjects([]);

      setCurriculumError("");

      setCurriculumLoading(
        Boolean(
          nextStudentId &&
          nextSemester,
        ),
      );
    }

    setModalError("");
  }


  function updateSubjectField(
    subjectCode: string,
    field: SubjectScoreField,
    value: string,
  ) {
    setSubjectForms(
      (currentSubjects) =>
        currentSubjects.map(
          (subject) =>
            subject.subjectCode ===
            subjectCode
              ? {
                  ...subject,
                  [field]: value,
                }
              : subject,
        ),
    );


    setSubjectErrors(
      (currentErrors) => {
        const updatedErrors = {
          ...currentErrors,
        };

        const subjectFieldErrors = {
          ...updatedErrors[
            subjectCode
          ],
        };

        delete subjectFieldErrors[
          field
        ];

        if (
          Object.keys(
            subjectFieldErrors,
          ).length === 0
        ) {
          delete updatedErrors[
            subjectCode
          ];
        } else {
          updatedErrors[
            subjectCode
          ] = subjectFieldErrors;
        }

        return updatedErrors;
      },
    );

    setModalError("");
  }


  function validateForm():
    boolean {
    const errors: Partial<
      Record<
        keyof AcademicRecordFormState,
        string
      >
    > = {};

    const newSubjectErrors:
      SubjectFormErrors = {};


    if (!form.studentId) {
      errors.studentId =
        "Please select a student.";
    }


    if (!form.semester) {
      errors.semester =
        "Please select a semester.";
    } else {
      const semester =
        Number(
          form.semester,
        );

      if (
        !Number.isInteger(
          semester,
        ) ||
        semester < 1 ||
        semester > 8
      ) {
        errors.semester =
          "Semester must be between 1 and 8.";
      } else if (
        semester > 1
      ) {
        if (
          !form.previousGpa
            .trim()
        ) {
          errors.previousGpa =
            "Previous GPA is required for Semester 2 and above.";
        } else {
          const previousGpa =
            Number(
              form.previousGpa,
            );

          if (
            Number.isNaN(
              previousGpa,
            ) ||
            previousGpa < 0 ||
            previousGpa > 4
          ) {
            errors.previousGpa =
              "Previous GPA must be between 0 and 4.";
          }
        }
      }
    }


    if (!form.gender) {
      errors.gender =
        "Please select gender.";
    }


    for (
      const subject
      of subjectForms
    ) {
      const currentErrors:
        Partial<
          Record<
            SubjectScoreField,
            string
          >
        > = {};


      validateSubjectPercentage(
        subject.attendance,
        "Attendance",
        "attendance",
        currentErrors,
      );


      validateSubjectPercentage(
        subject.internalMarks,
        "Internal marks",
        "internalMarks",
        currentErrors,
      );


      validateSubjectPercentage(
        subject.assignmentScore,
        "Assignment score",
        "assignmentScore",
        currentErrors,
      );


      validateSubjectPercentage(
        subject.quizScore,
        "Quiz score",
        "quizScore",
        currentErrors,
      );


      if (
        Object.keys(
          currentErrors,
        ).length > 0
      ) {
        newSubjectErrors[
          subject.subjectCode
        ] = currentErrors;
      }
    }


    setFormErrors(errors);

    setSubjectErrors(
      newSubjectErrors,
    );


    if (
      subjectForms.length ===
      0
    ) {
      setModalError(
        curriculumError ||
          "Please select a valid student and semester so the subjects can be loaded.",
      );

      return false;
    }


    if (curriculumError) {
      setModalError(
        curriculumError,
      );

      return false;
    }


    return (
      Object.keys(
        errors,
      ).length === 0 &&
      Object.keys(
        newSubjectErrors,
      ).length === 0
    );
  }


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    if (!token) {
      setModalError(
        "You are not authenticated.",
      );

      return;
    }


    if (curriculumLoading) {
      setModalError(
        "Please wait while the subjects are loading.",
      );

      return;
    }


    if (!validateForm()) {
      return;
    }


    try {
      setSubmitting(true);

      setModalError("");
      setError("");
      setSuccessMessage("");


      const semester =
        Number(
          form.semester,
        );


      const payload:
        CreateAcademicRecordPayload = {
          student_id:
            Number(
              form.studentId,
            ),

          previous_gpa:
            semester === 1
              ? null
              : Number(
                  form.previousGpa,
                ),

          semester,

          gender:
            form.gender,

          subject_records:
            subjectForms.map(
              (subject) => ({
                subject_code:
                  subject.subjectCode,

                attendance:
                  Number(
                    subject.attendance,
                  ),

                internal_marks:
                  Number(
                    subject.internalMarks,
                  ),

                assignment_score:
                  Number(
                    subject.assignmentScore,
                  ),

                quiz_score:
                  Number(
                    subject.quizScore,
                  ),
              }),
            ),
        };


      if (editingRecord) {
        await updateAcademicRecord(
          token,
          editingRecord.id,
          payload,
        );

        setSuccessMessage(
          "Academic record updated successfully.",
        );
      } else {
        await createAcademicRecord(
          token,
          payload,
        );

        setSuccessMessage(
          "Academic record created successfully.",
        );
      }


      setIsModalOpen(false);
      setEditingRecord(null);

      setForm({
        ...emptyForm,
      });

      setSubjectForms([]);
      setSubjectErrors({});
      setExcludedSubjects([]);

      setCurriculumLoading(false);
      setCurriculumError("");

      setFormErrors({});
      setModalError("");


      await fetchData();
    } catch (requestError) {
      console.error(
        "Failed to save academic record:",
        requestError,
      );

      setModalError(
        getErrorMessage(
          requestError,
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }


  function resetFilters() {
    setSearchInput("");
    setSemesterFilter("");
    setGenderFilter("");
    setPage(1);
  }


  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <FiBookOpen
              size={30}
              className="text-blue-600"
            />

            <h1 className="text-3xl font-bold text-gray-900">
              Academic Records
            </h1>
          </div>

          <p className="mt-2 text-gray-500">
            Manage subject-wise academic
            performance for each student
            and semester.
          </p>
        </div>


        <button
          type="button"
          onClick={
            openCreateModal
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          <FiPlus />

          Add Academic Record
        </button>
      </header>


      {successMessage && (
        <AlertMessage
          type="success"
          message={
            successMessage
          }
          onClose={() =>
            setSuccessMessage("")
          }
        />
      )}


      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() =>
            setError("")
          }
        />
      )}


      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={
                searchInput
              }
              onChange={(
                event,
              ) => {
                setSearchInput(
                  event.target.value,
                );

                setPage(1);
              }}
              placeholder="Search by student..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>


          <select
            value={
              semesterFilter
            }
            onChange={(
              event,
            ) => {
              setSemesterFilter(
                event.target.value,
              );

              setPage(1);
            }}
            className={
              getInputClass(
                false,
              )
            }
          >
            <option value="">
              All semesters
            </option>

            {Array.from(
              {
                length: 8,
              },
              (_, index) => (
                <option
                  key={
                    index + 1
                  }
                  value={
                    index + 1
                  }
                >
                  Semester{" "}
                  {index + 1}
                </option>
              ),
            )}
          </select>


          <select
            value={
              genderFilter
            }
            onChange={(
              event,
            ) => {
              setGenderFilter(
                event.target.value,
              );

              setPage(1);
            }}
            className={
              getInputClass(
                false,
              )
            }
          >
            <option value="">
              All genders
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>

            <option value="Other">
              Other
            </option>
          </select>


          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                void fetchData()
              }
              disabled={
                loading
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <FiRefreshCw
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </section>


      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        {loading ? (
          <LoadingState />
        ) : filteredRecords.length ===
          0 ? (
          <EmptyState
            onAdd={
              openCreateModal
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>
                    Student
                  </TableHeader>

                  <TableHeader>
                    Semester
                  </TableHeader>

                  <TableHeader>
                    Subjects
                  </TableHeader>

                  <TableHeader>
                    Avg Attendance
                  </TableHeader>

                  <TableHeader>
                    Avg Internal
                  </TableHeader>

                  <TableHeader>
                    Avg Assignment
                  </TableHeader>

                  <TableHeader>
                    Avg Quiz
                  </TableHeader>

                  <TableHeader>
                    Previous GPA
                  </TableHeader>

                  <TableHeader>
                    Gender
                  </TableHeader>

                  <TableHeader align="right">
                    Actions
                  </TableHeader>
                </tr>
              </thead>


              <tbody className="divide-y divide-gray-100">
                {paginatedRecords.map(
                  (record) => {
                    const student =
                      studentsById.get(
                        record.student_id,
                      );

                    const subjectCount =
                      record
                        .subject_records
                        ?.length ?? 0;


                    return (
                      <tr
                        key={
                          record.id
                        }
                        className="hover:bg-gray-50"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {student?.full_name ??
                                `Student #${record.student_id}`}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {student?.roll_number ??
                                "Student information unavailable"}
                            </p>
                          </div>
                        </TableCell>


                        <TableCell>
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                            Semester{" "}
                            {record.semester}
                          </span>
                        </TableCell>


                        <TableCell>
                          {subjectCount >
                          0 ? (
                            <span className="font-medium text-gray-900">
                              {subjectCount}{" "}
                              subject
                              {subjectCount ===
                              1
                                ? ""
                                : "s"}
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                              Legacy
                            </span>
                          )}
                        </TableCell>


                        <TableCell>
                          {formatScore(
                            record.attendance,
                            "%",
                          )}
                        </TableCell>


                        <TableCell>
                          {formatScore(
                            record.internal_marks,
                          )}
                        </TableCell>


                        <TableCell>
                          {formatScore(
                            record.assignment_score,
                          )}
                        </TableCell>


                        <TableCell>
                          {formatScore(
                            record.quiz_score,
                          )}
                        </TableCell>


                        <TableCell>
                          {record.previous_gpa ===
                          null ? (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                              N/A
                            </span>
                          ) : (
                            <span className="font-semibold text-gray-900">
                              {Number(
                                record.previous_gpa,
                              ).toFixed(
                                2,
                              )}
                            </span>
                          )}
                        </TableCell>


                        <TableCell>
                          {
                            record.gender
                          }
                        </TableCell>


                        <TableCell align="right">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                record,
                              )
                            }
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Edit academic record"
                            aria-label="Edit academic record"
                          >
                            <FiEdit2 />
                          </button>
                        </TableCell>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}


        <Pagination
          page={
            safePage
          }
          totalPages={
            totalPages
          }
          totalItems={
            filteredRecords.length
          }
          loading={
            loading
          }
          onPageChange={
            setPage
          }
        />
      </section>


      {isModalOpen && (
        <AcademicRecordModal
          editingRecord={
            editingRecord
          }
          students={
            students
          }
          selectedStudent={
            selectedStudent
          }
          form={
            form
          }
          formErrors={
            formErrors
          }
          subjectForms={
            subjectForms
          }
          subjectErrors={
            subjectErrors
          }
          excludedSubjects={
            excludedSubjects
          }
          curriculumLoading={
            curriculumLoading
          }
          curriculumError={
            curriculumError
          }
          modalError={
            modalError
          }
          submitting={
            submitting
          }
          onClose={
            closeModal
          }
          onSubmit={
            handleSubmit
          }
          onFieldChange={
            updateFormField
          }
          onSubjectFieldChange={
            updateSubjectField
          }
        />
      )}
    </div>
  );
}


interface AcademicRecordModalProps {
  editingRecord:
    AcademicRecord | null;

  students:
    AdminStudent[];

  selectedStudent:
    AdminStudent | null;

  form:
    AcademicRecordFormState;

  formErrors:
    Partial<
      Record<
        keyof AcademicRecordFormState,
        string
      >
    >;

  subjectForms:
    SubjectAcademicRecordFormState[];

  subjectErrors:
    SubjectFormErrors;

  excludedSubjects:
    CurriculumSubject[];

  curriculumLoading:
    boolean;

  curriculumError:
    string;

  modalError:
    string;

  submitting:
    boolean;

  onClose:
    () => void;

  onSubmit:
    (
      event:
        FormEvent<HTMLFormElement>,
    ) => Promise<void>;

  onFieldChange:
    (
      field:
        keyof AcademicRecordFormState,
      value:
        string,
    ) => void;

  onSubjectFieldChange:
    (
      subjectCode:
        string,
      field:
        SubjectScoreField,
      value:
        string,
    ) => void;
}


function AcademicRecordModal({
  editingRecord,
  students,
  selectedStudent,
  form,
  formErrors,
  subjectForms,
  subjectErrors,
  excludedSubjects,
  curriculumLoading,
  curriculumError,
  modalError,
  submitting,
  onClose,
  onSubmit,
  onFieldChange,
  onSubjectFieldChange,
}: AcademicRecordModalProps) {
  const isFirstSemester =
    form.semester === "1";


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingRecord
                ? "Edit Academic Record"
                : "Add Academic Record"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter subject-wise
              performance for the
              selected semester.
            </p>
          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={
              submitting
            }
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close modal"
          >
            <FiX size={21} />
          </button>
        </div>


        <form
          onSubmit={(
            event,
          ) =>
            void onSubmit(
              event,
            )
          }
          className="p-6"
        >
          {modalError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {modalError}
            </div>
          )}


          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField
                label="Student"
                required
                error={
                  formErrors.studentId
                }
              >
                <select
                  value={
                    form.studentId
                  }
                  onChange={(
                    event,
                  ) =>
                    onFieldChange(
                      "studentId",
                      event.target.value,
                    )
                  }
                  disabled={
                    submitting
                  }
                  className={
                    getInputClass(
                      Boolean(
                        formErrors.studentId,
                      ),
                    )
                  }
                >
                  <option value="">
                    Select student
                  </option>

                  {students.map(
                    (student) => (
                      <option
                        key={
                          student.id
                        }
                        value={
                          student.id
                        }
                      >
                        {
                          student.full_name
                        }{" "}
                        —{" "}
                        {
                          student.roll_number
                        }{" "}
                        —{" "}
                        {
                          student.department
                        }
                      </option>
                    ),
                  )}
                </select>
              </FormField>
            </div>


            {selectedStudent && (
              <div className="md:col-span-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Department
                </p>

                <p className="mt-1 font-medium text-blue-900">
                  {normalizeDepartmentForCurriculum(
                    selectedStudent.department,
                  )}
                </p>

                <p className="mt-1 text-xs text-blue-700">
                  Subjects are loaded
                  automatically from the
                  selected department and
                  semester.
                </p>
              </div>
            )}


            <FormField
              label="Semester"
              required
              error={
                formErrors.semester
              }
            >
              <select
                value={
                  form.semester
                }
                onChange={(
                  event,
                ) =>
                  onFieldChange(
                    "semester",
                    event.target.value,
                  )
                }
                disabled={
                  submitting
                }
                className={
                  getInputClass(
                    Boolean(
                      formErrors.semester,
                    ),
                  )
                }
              >
                <option value="">
                  Select semester
                </option>

                {Array.from(
                  {
                    length: 8,
                  },
                  (_, index) => (
                    <option
                      key={
                        index + 1
                      }
                      value={
                        index + 1
                      }
                    >
                      Semester{" "}
                      {index + 1}
                    </option>
                  ),
                )}
              </select>
            </FormField>


            <FormField
              label="Gender"
              required
              error={
                formErrors.gender
              }
            >
              <select
                value={
                  form.gender
                }
                onChange={(
                  event,
                ) =>
                  onFieldChange(
                    "gender",
                    event.target.value,
                  )
                }
                disabled={
                  submitting
                }
                className={
                  getInputClass(
                    Boolean(
                      formErrors.gender,
                    ),
                  )
                }
              >
                <option value="">
                  Select gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </FormField>


            {!isFirstSemester && (
              <FormField
                label="Previous GPA"
                required
                error={
                  formErrors.previousGpa
                }
              >
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  value={
                    form.previousGpa
                  }
                  onChange={(
                    event,
                  ) =>
                    onFieldChange(
                      "previousGpa",
                      event.target.value,
                    )
                  }
                  placeholder="Example: 3.25"
                  disabled={
                    submitting
                  }
                  className={
                    getInputClass(
                      Boolean(
                        formErrors.previousGpa,
                      ),
                    )
                  }
                />
              </FormField>
            )}
          </div>


          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Subject-wise Performance
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Enter attendance,
                internal marks,
                assignment score and
                quiz score for each
                regular subject.
              </p>
            </div>


            {!form.studentId ||
            !form.semester ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center text-sm text-gray-500">
                Select a student and
                semester to load subjects.
              </div>
            ) : curriculumLoading ? (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-5 py-8 text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                <p className="mt-3 text-sm text-blue-700">
                  Loading curriculum...
                </p>
              </div>
            ) : curriculumError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                {curriculumError}
              </div>
            ) : subjectForms.length ===
              0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
                No standard subjects
                were found for this
                department and semester.
              </div>
            ) : (
              <div className="space-y-4">
                {subjectForms.map(
                  (
                    subject,
                    index,
                  ) => (
                    <SubjectPerformanceCard
                      key={
                        subject.subjectCode
                      }
                      index={
                        index
                      }
                      subject={
                        subject
                      }
                      errors={
                        subjectErrors[
                          subject.subjectCode
                        ]
                      }
                      submitting={
                        submitting
                      }
                      onChange={
                        onSubjectFieldChange
                      }
                    />
                  ),
                )}
              </div>
            )}


            {excludedSubjects.length >
              0 && (
              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                <p className="text-sm font-semibold text-gray-700">
                  Other Curriculum Components
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  These components use
                  a different assessment
                  format and are not
                  included in the regular
                  ML semester average.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {excludedSubjects.map(
                    (subject) => (
                      <span
                        key={
                          subject.code
                        }
                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600"
                      >
                        {subject.name}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>


          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={
                submitting
              }
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                curriculumLoading ||
                subjectForms.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
              )}

              {submitting
                ? "Saving..."
                : editingRecord
                  ? "Save Changes"
                  : "Create Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function SubjectPerformanceCard({
  index,
  subject,
  errors,
  submitting,
  onChange,
}: {
  index: number;

  subject:
    SubjectAcademicRecordFormState;

  errors?:
    Partial<
      Record<
        SubjectScoreField,
        string
      >
    >;

  submitting:
    boolean;

  onChange:
    (
      subjectCode:
        string,
      field:
        SubjectScoreField,
      value:
        string,
    ) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          Subject {index + 1}
        </p>

        <h4 className="mt-1 font-semibold text-gray-900">
          {subject.subjectName}
        </h4>

        <p className="mt-1 text-xs text-gray-500">
          {subject.subjectCode}
          {" · "}
          {subject.credits}
          {" "}
          credit
          {subject.credits === 1
            ? ""
            : "s"}
        </p>
      </div>


      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SubjectScoreInput
          label="Attendance (%)"
          value={
            subject.attendance
          }
          error={
            errors?.attendance
          }
          submitting={
            submitting
          }
          onChange={(value) =>
            onChange(
              subject.subjectCode,
              "attendance",
              value,
            )
          }
        />

        <SubjectScoreInput
          label="Internal Marks"
          value={
            subject.internalMarks
          }
          error={
            errors?.internalMarks
          }
          submitting={
            submitting
          }
          onChange={(value) =>
            onChange(
              subject.subjectCode,
              "internalMarks",
              value,
            )
          }
        />

        <SubjectScoreInput
          label="Assignment Score"
          value={
            subject.assignmentScore
          }
          error={
            errors?.assignmentScore
          }
          submitting={
            submitting
          }
          onChange={(value) =>
            onChange(
              subject.subjectCode,
              "assignmentScore",
              value,
            )
          }
        />

        <SubjectScoreInput
          label="Quiz Score"
          value={
            subject.quizScore
          }
          error={
            errors?.quizScore
          }
          submitting={
            submitting
          }
          onChange={(value) =>
            onChange(
              subject.subjectCode,
              "quizScore",
              value,
            )
          }
        />
      </div>
    </div>
  );
}


function SubjectScoreInput({
  label,
  value,
  error,
  submitting,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  submitting: boolean;
  onChange:
    (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}

        <span className="ml-1 text-red-500">
          *
        </span>
      </span>

      <input
        type="number"
        min="0"
        max="100"
        step="0.01"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder="0 - 100"
        disabled={
          submitting
        }
        className={
          getInputClass(
            Boolean(error),
          )
        }
      />

      {error && (
        <span className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}


function FormField({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}

      {error && (
        <span className="mt-1 block text-sm text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}


function TableHeader({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?:
    | "left"
    | "right";
}) {
  return (
    <th
      className={`whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}


function TableCell({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?:
    | "left"
    | "right";
}) {
  return (
    <td
      className={`whitespace-nowrap px-5 py-4 text-sm text-gray-700 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}


function AlertMessage({
  type,
  message,
  onClose,
}: {
  type:
    | "success"
    | "error";

  message:
    string;

  onClose:
    () => void;
}) {
  const classes =
    type === "success"
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 ${classes}`}
    >
      <p>
        {message}
      </p>

      <button
        type="button"
        onClick={
          onClose
        }
        aria-label="Close message"
      >
        <FiX />
      </button>
    </div>
  );
}


function LoadingState() {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

      <p className="mt-4 text-gray-500">
        Loading academic records...
      </p>
    </div>
  );
}


function EmptyState({
  onAdd,
}: {
  onAdd:
    () => void;
}) {
  return (
    <div className="p-12 text-center">
      <FiBookOpen
        size={46}
        className="mx-auto text-gray-300"
      />

      <p className="mt-4 font-medium text-gray-700">
        No academic records found
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Add the first
        subject-wise academic record.
      </p>

      <button
        type="button"
        onClick={
          onAdd
        }
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white"
      >
        <FiPlus />

        Add Academic Record
      </button>
    </div>
  );
}


function Pagination({
  page,
  totalPages,
  totalItems,
  loading,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  loading: boolean;

  onPageChange:
    (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Page {page} of{" "}
        {totalPages} ·{" "}
        {totalItems} record
        {totalItems === 1
          ? ""
          : "s"}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={
            page === 1 ||
            loading
          }
          onClick={() =>
            onPageChange(
              Math.max(
                1,
                page - 1,
              ),
            )
          }
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
        >
          <FiChevronLeft />

          Previous
        </button>

        <button
          type="button"
          disabled={
            page >= totalPages ||
            loading
          }
          onClick={() =>
            onPageChange(
              Math.min(
                totalPages,
                page + 1,
              ),
            )
          }
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
        >
          Next

          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}


function createEmptySubjectForm(
  subject:
    CurriculumSubject,
): SubjectAcademicRecordFormState {
  return {
    subjectCode:
      subject.code,

    subjectName:
      subject.name,

    credits:
      subject.credits,

    attendance: "",
    internalMarks: "",
    assignmentScore: "",
    quizScore: "",
  };
}


function validateSubjectPercentage(
  value: string,

  label: string,

  field:
    SubjectScoreField,

  errors:
    Partial<
      Record<
        SubjectScoreField,
        string
      >
    >,
) {
  if (!value.trim()) {
    errors[field] =
      `${label} is required.`;

    return;
  }

  const numericValue =
    Number(value);

  if (
    Number.isNaN(
      numericValue,
    ) ||
    numericValue < 0 ||
    numericValue > 100
  ) {
    errors[field] =
      `${label} must be between 0 and 100.`;
  }
}


function normalizeDepartmentForCurriculum(
  department: string,
): string {
  const normalized =
    department
      .trim()
      .toLowerCase();


  if (
    normalized ===
      "computer engineering" ||
    normalized ===
      "computer science" ||
    normalized ===
      "computer" ||
    normalized ===
      "bct"
  ) {
    return (
      "Computer Engineering"
    );
  }


  if (
    normalized ===
      "bei" ||
    normalized ===
      "electronics engineering" ||
    normalized ===
      "electronics, communication and information engineering" ||
    normalized ===
      "electronics communication and information engineering"
  ) {
    return (
      "Electronics, Communication and Information Engineering"
    );
  }


  return department;
}


function getInputClass(
  hasError: boolean,
): string {
  return [
    "w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",

    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
  ].join(" ");
}


function formatScore(
  value: number,
  suffix = "",
): string {
  return `${Number(
    value,
  ).toFixed(2)}${suffix}`;
}


function getErrorMessage(
  error: unknown,
): string {
  if (
    axios.isAxiosError(
      error,
    )
  ) {
    const detail =
      error.response
        ?.data
        ?.detail;


    if (
      typeof detail ===
      "string"
    ) {
      return detail;
    }


    if (
      Array.isArray(
        detail,
      )
    ) {
      return detail
        .map(
          (item) => {
            if (
              typeof item ===
                "object" &&
              item !== null &&
              "msg" in item &&
              typeof item.msg ===
                "string"
            ) {
              return item.msg;
            }

            return "Validation error";
          },
        )
        .join(", ");
    }


    if (
      error.response?.status ===
      401
    ) {
      return (
        "Your session has expired."
      );
    }


    if (
      error.response?.status ===
      403
    ) {
      return (
        "You do not have permission to manage academic records."
      );
    }


    if (
      error.response?.status ===
      404
    ) {
      return (
        "The academic record, student or curriculum was not found."
      );
    }


    if (
      error.response?.status ===
      422
    ) {
      return (
        "Please check all entered academic values."
      );
    }


    if (!error.response) {
      return (
        "Cannot connect to the backend server."
      );
    }
  }


  return (
    "Something went wrong. Please try again."
  );
}


export default AdminAcademicRecordsPage;