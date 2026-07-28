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
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiMail,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiTrendingUp,
  FiUser,
  FiX,
} from "react-icons/fi";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import StatCard from "../../../components/cards/StatCard";

import { useAuth } from "../../auth/context/useAuth";

import {
  createTeacherStudentIntervention,
  generateTeacherStudentPrediction,
  getTeacherPredictionShap,
  getTeacherStudentProfile,
} from "../services/teacherStudentProfileService";

import type {
  TeacherShapFeature,
  TeacherStudentAcademicRecord,
  TeacherStudentProfileResponse,
} from "../types/teacherStudentProfile";


function TeacherStudentProfilePage() {
  const { token } = useAuth();

  const { studentId } = useParams();

  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<TeacherStudentProfileResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [
    generatingPrediction,
    setGeneratingPrediction,
  ] = useState(false);

  const [
    interventionModalOpen,
    setInterventionModalOpen,
  ] = useState(false);

  const [
    interventionAction,
    setInterventionAction,
  ] = useState("");

  const [
    interventionRemarks,
    setInterventionRemarks,
  ] = useState("");

  const [
    interventionError,
    setInterventionError,
  ] = useState("");

  const [
    submittingIntervention,
    setSubmittingIntervention,
  ] = useState(false);

  const [shapModalOpen, setShapModalOpen] =
    useState(false);

  const [shapLoading, setShapLoading] =
    useState(false);

  const [shapError, setShapError] =
    useState("");

  const [shapFeatures, setShapFeatures] =
    useState<TeacherShapFeature[]>([]);


  const parsedStudentId = Number(studentId);


  const fetchProfile =
    useCallback(async () => {
      if (!token) {
        setError(
          "You are not authenticated.",
        );

        setLoading(false);
        return;
      }

      if (
        !studentId
        || Number.isNaN(parsedStudentId)
        || parsedStudentId <= 0
      ) {
        setError("Invalid student ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const profileData =
          await getTeacherStudentProfile(
            token,
            parsedStudentId,
          );

        setProfile(profileData);
      } catch (requestError) {
        console.error(
          "Teacher student profile error:",
          requestError,
        );

        setError(
          getErrorMessage(requestError),
        );
      } finally {
        setLoading(false);
      }
    }, [
      parsedStudentId,
      studentId,
      token,
    ]);


  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);


  const latestAcademicRecord =
    useMemo<TeacherStudentAcademicRecord | null>(
      () => {
        if (
          !profile
          || profile.academic_records.length
            === 0
        ) {
          return null;
        }

        return [
          ...profile.academic_records,
        ].sort(
          (
            firstRecord,
            secondRecord,
          ) => {
            if (
              secondRecord.semester
              !== firstRecord.semester
            ) {
              return (
                secondRecord.semester
                - firstRecord.semester
              );
            }

            return (
              secondRecord.id
              - firstRecord.id
            );
          },
        )[0];
      },
      [profile],
    );


  async function handleGeneratePrediction() {
    if (
      !token
      || Number.isNaN(parsedStudentId)
    ) {
      return;
    }

    if (!latestAcademicRecord) {
      setError(
        "An academic record must be added before generating a prediction.",
      );

      return;
    }

    try {
      setGeneratingPrediction(true);
      setError("");
      setSuccessMessage("");

      await generateTeacherStudentPrediction(
        token,
        parsedStudentId,
      );

      await fetchProfile();

      setSuccessMessage(
        "Prediction, SHAP explanation and personalised recommendation generated successfully.",
      );
    } catch (requestError) {
      console.error(
        "Prediction generation failed:",
        requestError,
      );

      setError(
        getErrorMessage(requestError),
      );
    } finally {
      setGeneratingPrediction(false);
    }
  }


  function openInterventionModal() {
    setInterventionAction("");
    setInterventionRemarks("");
    setInterventionError("");
    setInterventionModalOpen(true);
  }


  function closeInterventionModal() {
    if (submittingIntervention) {
      return;
    }

    setInterventionModalOpen(false);
    setInterventionAction("");
    setInterventionRemarks("");
    setInterventionError("");
  }


  async function handleCreateIntervention(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !token
      || Number.isNaN(parsedStudentId)
    ) {
      return;
    }

    const cleanedAction =
      interventionAction.trim();

    if (cleanedAction.length < 5) {
      setInterventionError(
        "Action taken must contain at least 5 characters.",
      );

      return;
    }

    try {
      setSubmittingIntervention(true);
      setInterventionError("");
      setSuccessMessage("");

      await createTeacherStudentIntervention(
        token,
        parsedStudentId,
        {
          action_taken: cleanedAction,
          remarks:
            interventionRemarks.trim()
            || null,
        },
      );

      setInterventionModalOpen(false);
      setInterventionAction("");
      setInterventionRemarks("");

      await fetchProfile();

      setSuccessMessage(
        "Intervention recorded successfully.",
      );
    } catch (requestError) {
      console.error(
        "Intervention creation failed:",
        requestError,
      );

      setInterventionError(
        getErrorMessage(requestError),
      );
    } finally {
      setSubmittingIntervention(false);
    }
  }


  async function handleViewShap() {
    if (
      !token
      || !profile?.latest_prediction
    ) {
      return;
    }

    try {
      setShapModalOpen(true);
      setShapLoading(true);
      setShapError("");
      setShapFeatures([]);

      const response =
        await getTeacherPredictionShap(
          token,
          profile.latest_prediction.id,
        );

      const normalizedFeatures =
        normalizeShapResponse(response);

      setShapFeatures(normalizedFeatures);

      if (
        normalizedFeatures.length === 0
      ) {
        setShapError(
          "No SHAP explanation is available for this prediction.",
        );
      }
    } catch (requestError) {
      console.error(
        "Failed to load SHAP explanation:",
        requestError,
      );

      setShapError(
        getErrorMessage(requestError),
      );
    } finally {
      setShapLoading(false);
    }
  }


  if (loading) {
    return <LoadingState />;
  }


  if (error && !profile) {
    return (
      <div className="space-y-4">
        <BackButton
          onClick={() =>
            navigate("/teacher/students")
          }
        />

        <ErrorMessage
          message={error}
          onRetry={() =>
            void fetchProfile()
          }
        />
      </div>
    );
  }


  if (!profile) {
    return (
      <p className="text-gray-600">
        No student profile available.
      </p>
    );
  }


  return (
    <div className="space-y-8">
      <header>
        <BackButton
          onClick={() =>
            navigate("/teacher/students")
          }
        />

        <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Profile
            </h1>

            <p className="mt-2 text-gray-500">
              Review performance, generate
              predictions and record interventions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                void handleGeneratePrediction()
              }
              disabled={
                generatingPrediction
                || !latestAcademicRecord
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiRefreshCw
                className={
                  generatingPrediction
                    ? "animate-spin"
                    : ""
                }
              />

              {generatingPrediction
                ? "Generating..."
                : "Generate Prediction"}
            </button>

            <button
              type="button"
              onClick={openInterventionModal}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700"
            >
              <FiPlus />
              Add Intervention
            </button>
          </div>
        </div>
      </header>


      {successMessage && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
          <div className="flex gap-3">
            <FiCheckCircle
              className="mt-0.5"
              size={20}
            />

            <p>{successMessage}</p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
          >
            <FiX />
          </button>
        </div>
      )}


      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          <div className="flex gap-3">
            <FiAlertCircle
              className="mt-0.5"
              size={20}
            />

            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <FiX />
          </button>
        </div>
      )}


      <section className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <FiUser
            size={26}
            className="text-blue-600"
          />

          <h2 className="text-xl font-semibold text-gray-900">
            Student Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <InformationItem
            label="Student ID"
            value={profile.student.id}
          />

          <InformationItem
            label="Roll Number"
            value={
              profile.student.roll_number
            }
          />

          <InformationItem
            label="Department"
            value={
              profile.student.department
            }
          />

          <InformationItem
            label="Semester"
            value={`Semester ${profile.student.semester}`}
          />

          <InformationItem
            label="Phone"
            value={
              profile.student.phone
              || "N/A"
            }
            icon={<FiPhone />}
          />

          <InformationItem
            label="Parent Email"
            value={
              profile.student.parent_email
              || "N/A"
            }
            icon={<FiMail />}
          />

          <InformationItem
            label="Enrollment Year"
            value={
              profile.student.enrollment_year
            }
            icon={<FiCalendar />}
          />

          <InformationItem
            label="Status"
            value={profile.student.status}
            icon={<FiCheckCircle />}
          />
        </div>
      </section>


      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Academic Summary
        </h2>

        {latestAcademicRecord ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Attendance"
              value={`${latestAcademicRecord.attendance}%`}
              icon={
                <FiClipboard size={30} />
              }
            />

            <StatCard
              title="Internal Marks"
              value={
                latestAcademicRecord
                  .internal_marks
              }
              icon={
                <FiBookOpen size={30} />
              }
            />

            <StatCard
              title="Assignment Score"
              value={
                latestAcademicRecord
                  .assignment_score
              }
              icon={
                <FiClipboard size={30} />
              }
            />

            <StatCard
              title="Quiz Score"
              value={
                latestAcademicRecord
                  .quiz_score
              }
              icon={
                <FiTrendingUp size={30} />
              }
            />

            <StatCard
              title="Previous GPA"
              value={
                latestAcademicRecord
                  .previous_gpa
              }
              icon={
                <FiTrendingUp size={30} />
              }
            />
          </div>
        ) : (
          <EmptyCard
            message="No academic records are available for this student."
          />
        )}
      </section>


      <section className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Latest Prediction
          </h2>

          {profile.latest_prediction && (
            <button
              type="button"
              onClick={() =>
                void handleViewShap()
              }
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              <FiBarChart2 />
              View SHAP Explanation
            </button>
          )}
        </div>

        {profile.latest_prediction ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium ${getRiskClass(
                  profile.latest_prediction
                    .risk_level,
                )}`}
              >
                <FiAlertTriangle />

                {
                  profile.latest_prediction
                    .risk_level
                }
              </span>

              {profile.latest_prediction
                .prediction_date && (
                <span className="text-sm text-gray-500">
                  Generated{" "}
                  {formatDate(
                    profile.latest_prediction
                      .prediction_date,
                  )}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <ProbabilityCard
                label="Low Risk"
                value={formatProbability(
                  profile.latest_prediction
                    .low_probability,
                )}
                className="text-green-700"
              />

              <ProbabilityCard
                label="Medium Risk"
                value={formatProbability(
                  profile.latest_prediction
                    .medium_probability,
                )}
                className="text-yellow-700"
              />

              <ProbabilityCard
                label="High Risk"
                value={formatProbability(
                  profile.latest_prediction
                    .high_probability,
                )}
                className="text-red-700"
              />
            </div>
          </div>
        ) : (
          <EmptyCard
            message="No prediction has been generated for this student."
          />
        )}
      </section>


      <section className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-5 text-xl font-semibold text-gray-900">
          Latest Recommendation
        </h2>

        {profile.latest_recommendation ? (
          <div className="rounded-lg border border-gray-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {
                  profile.latest_recommendation
                    .title
                }
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityClass(
                  profile.latest_recommendation
                    .priority,
                )}`}
              >
                {
                  profile.latest_recommendation
                    .priority
                }{" "}
                Priority
              </span>
            </div>

            <p className="mt-4 leading-7 text-gray-600">
              {
                profile.latest_recommendation
                  .description
              }
            </p>
          </div>
        ) : (
          <EmptyCard
            message="No recommendation is available."
          />
        )}
      </section>


      <section className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-5 flex items-center gap-3">
          <FiActivity
            className="text-blue-600"
            size={24}
          />

          <h2 className="text-xl font-semibold text-gray-900">
            Intervention History
          </h2>
        </div>

        {profile.interventions.length === 0 ? (
          <p className="text-gray-500">
            No interventions have been recorded.
          </p>
        ) : (
          <div className="space-y-4">
            {profile.interventions.map(
              (intervention) => (
                <article
                  key={intervention.id}
                  className="rounded-lg border border-gray-200 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="font-semibold text-gray-900">
                      {
                        intervention
                          .action_taken
                      }
                    </p>

                    <span className="text-xs text-gray-500">
                      Intervention #
                      {intervention.id}
                    </span>
                  </div>

                  <p className="mt-2 text-gray-600">
                    {intervention.remarks
                      || "No additional remarks."}
                  </p>

                  {intervention
                    .intervention_date && (
                    <p className="mt-3 text-sm text-gray-500">
                      {formatDate(
                        intervention
                          .intervention_date,
                      )}
                    </p>
                  )}
                </article>
              ),
            )}
          </div>
        )}
      </section>


      {interventionModalOpen && (
        <InterventionModal
          action={interventionAction}
          remarks={interventionRemarks}
          error={interventionError}
          submitting={
            submittingIntervention
          }
          onActionChange={(value) => {
            setInterventionAction(value);
            setInterventionError("");
          }}
          onRemarksChange={
            setInterventionRemarks
          }
          onClose={
            closeInterventionModal
          }
          onSubmit={
            handleCreateIntervention
          }
        />
      )}


      {shapModalOpen && (
        <ShapModal
          riskLevel={
            profile.latest_prediction
              ?.risk_level
            || "Prediction"
          }
          features={shapFeatures}
          loading={shapLoading}
          error={shapError}
          onClose={() => {
            setShapModalOpen(false);
            setShapFeatures([]);
            setShapError("");
          }}
        />
      )}
    </div>
  );
}


function normalizeShapResponse(
  response: unknown,
): TeacherShapFeature[] {
  let source: unknown = response;

  if (
    typeof response === "object"
    && response !== null
    && "shap_values" in response
  ) {
    source = (
      response as {
        shap_values: unknown;
      }
    ).shap_values;
  }

  if (Array.isArray(source)) {
    return source
      .map((item) =>
        normalizeShapItem(item),
      )
      .filter(
        (
          item,
        ): item is TeacherShapFeature =>
          item !== null,
      )
      .sort(
        (first, second) =>
          Math.abs(second.shapValue)
          - Math.abs(first.shapValue),
      );
  }

  if (
    typeof source === "object"
    && source !== null
  ) {
    return Object.entries(
      source as Record<string, unknown>,
    )
      .map(([featureName, value]) =>
        normalizeShapMapEntry(
          featureName,
          value,
        ),
      )
      .filter(
        (
          item,
        ): item is TeacherShapFeature =>
          item !== null,
      )
      .sort(
        (first, second) =>
          Math.abs(second.shapValue)
          - Math.abs(first.shapValue),
      );
  }

  return [];
}


function normalizeShapItem(
  item: unknown,
): TeacherShapFeature | null {
  if (
    typeof item !== "object"
    || item === null
  ) {
    return null;
  }

  const record =
    item as Record<string, unknown>;

  const featureName =
    getString(
      record.feature_name,
    )
    || getString(record.feature)
    || getString(record.name);

  if (!featureName) {
    return null;
  }

  return {
    featureName,
    featureValue: getNullableNumber(
      record.feature_value
      ?? record.actual_value
      ?? record.input_value,
    ),
    shapValue: getNumber(
      record.shap_value
      ?? record.value
      ?? record.impact,
    ),
  };
}


function normalizeShapMapEntry(
  featureName: string,
  value: unknown,
): TeacherShapFeature | null {
  if (
    typeof value === "number"
  ) {
    return {
      featureName,
      featureValue: null,
      shapValue: value,
    };
  }

  if (
    typeof value !== "object"
    || value === null
  ) {
    return null;
  }

  const record =
    value as Record<string, unknown>;

  return {
    featureName,
    featureValue: getNullableNumber(
      record.feature_value
      ?? record.actual_value
      ?? record.input_value,
    ),
    shapValue: getNumber(
      record.shap_value
      ?? record.value
      ?? record.impact,
    ),
  };
}


function getString(
  value: unknown,
): string | null {
  return typeof value === "string"
    ? value
    : null;
}


function getNumber(
  value: unknown,
): number {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
}


function getNullableNumber(
  value: unknown,
): number | null {
  if (
    value === null
    || value === undefined
    || value === ""
  ) {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
}


function getErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    const detail =
      error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (!error.response) {
      return (
        "Cannot connect to the backend server."
      );
    }

    if (
      error.response.status === 401
    ) {
      return (
        "Your session has expired. "
        + "Please log in again."
      );
    }

    if (
      error.response.status === 403
    ) {
      return (
        "You do not have permission "
        + "to perform this action."
      );
    }

    if (
      error.response.status === 404
    ) {
      return (
        "The requested student or "
        + "record was not found."
      );
    }

    if (
      error.response.status === 422
    ) {
      return (
        "Please check the submitted values."
      );
    }
  }

  return "Something went wrong. Please try again.";
}


function formatProbability(
  value: number,
): string {
  return `${(
    Number(value) * 100
  ).toFixed(2)}%`;
}


function formatDate(
  date: string,
): string {
  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return "Unknown date";
  }

  return parsedDate.toLocaleString(
    "en-GB",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}


function getRiskClass(
  riskLevel: string,
): string {
  const risk =
    riskLevel.toLowerCase();

  if (risk.includes("high")) {
    return "bg-red-100 text-red-700";
  }

  if (risk.includes("medium")) {
    return (
      "bg-yellow-100 text-yellow-700"
    );
  }

  if (risk.includes("low")) {
    return (
      "bg-green-100 text-green-700"
    );
  }

  return "bg-gray-100 text-gray-700";
}


function getPriorityClass(
  priority: string,
): string {
  return getRiskClass(priority);
}


function BackButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
    >
      <FiArrowLeft />
      Back to Students
    </button>
  );
}


function InformationItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 flex items-center gap-2 wrap-break-word font-semibold text-gray-900">
        {icon}
        {value}
      </p>
    </div>
  );
}


function ProbabilityCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-5">
      <p className="text-sm text-gray-500">
        {label} Probability
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${className}`}
      >
        {value}
      </p>
    </div>
  );
}


function EmptyCard({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <p className="text-gray-500">
        {message}
      </p>
    </div>
  );
}


function LoadingState() {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-xl bg-white shadow-md">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

        <p className="mt-4 text-gray-600">
          Loading student profile...
        </p>
      </div>
    </div>
  );
}


function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <p className="text-red-700">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white"
      >
        <FiRefreshCw />
        Try Again
      </button>
    </div>
  );
}


function InterventionModal({
  action,
  remarks,
  error,
  submitting,
  onActionChange,
  onRemarksChange,
  onClose,
  onSubmit,
}: {
  action: string;
  remarks: string;
  error: string;
  submitting: boolean;
  onActionChange: (value: string) => void;
  onRemarksChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">
              Add Intervention
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Record the academic support provided
              to this student.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
          >
            <FiX size={22} />
          </button>
        </div>

        <form
          onSubmit={(event) =>
            void onSubmit(event)
          }
          className="space-y-5 p-6"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Action Taken
              <span className="text-red-500">
                *
              </span>
            </span>

            <textarea
              value={action}
              onChange={(event) =>
                onActionChange(
                  event.target.value,
                )
              }
              rows={4}
              disabled={submitting}
              placeholder="Example: Scheduled weekly counselling and assigned additional revision exercises."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Remarks
            </span>

            <textarea
              value={remarks}
              onChange={(event) =>
                onRemarksChange(
                  event.target.value,
                )
              }
              rows={3}
              disabled={submitting}
              placeholder="Optional additional notes"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : "Save Intervention"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function ShapModal({
  riskLevel,
  features,
  loading,
  error,
  onClose,
}: {
  riskLevel: string;
  features: TeacherShapFeature[];
  loading: boolean;
  error: string;
  onClose: () => void;
}) {
  const maximumImpact = Math.max(
    ...features.map((feature) =>
      Math.abs(feature.shapValue),
    ),
    0.0001,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between border-b border-gray-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">
              SHAP Prediction Explanation
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Feature influence on the predicted
              class: {riskLevel}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <LoadingState />
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {!loading
            && !error
            && features.length > 0 && (
            <div className="space-y-5">
              {features.map((feature) => {
                const width =
                  Math.max(
                    4,
                    (
                      Math.abs(
                        feature.shapValue,
                      )
                      / maximumImpact
                    )
                    * 100,
                  );

                return (
                  <div
                    key={feature.featureName}
                  >
                    <div className="mb-2 flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatFeatureName(
                            feature.featureName,
                          )}
                        </p>

                        <p className="text-xs text-gray-500">
                          Input value:{" "}
                          {feature.featureValue
                            ?? "N/A"}
                        </p>
                      </div>

                      <span
                        className={
                          feature.shapValue >= 0
                            ? "font-semibold text-red-600"
                            : "font-semibold text-green-600"
                        }
                      >
                        {feature.shapValue >= 0
                          ? "+"
                          : ""}
                        {feature.shapValue.toFixed(
                          4,
                        )}
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={
                          feature.shapValue >= 0
                            ? "h-full rounded-full bg-red-500"
                            : "h-full rounded-full bg-green-500"
                        }
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function formatFeatureName(
  value: string,
): string {
  return value
    .replace(
      /^(categorical|numeric)__/,
      "",
    )
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}


export default TeacherStudentProfilePage;