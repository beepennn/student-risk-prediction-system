import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiMail,
  FiPhone,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import StatCard from "../../../components/cards/StatCard";

import { useAuth } from "../../auth/context/useAuth";

import { getTeacherStudentProfile } from "../services/teacherStudentProfileService";

import type { TeacherStudentProfileResponse } from "../types/teacherStudentProfile";

function TeacherStudentProfilePage() {
  const { token } = useAuth();
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<TeacherStudentProfileResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      const parsedStudentId = Number(studentId);

      if (!studentId || Number.isNaN(parsedStudentId)) {
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
      } catch (error) {
        console.error(
          "Teacher student profile error:",
          error,
        );

        setError(
          "Failed to load student profile.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [studentId, token]);

  function getRiskClass(riskLevel: string) {
    const risk = riskLevel.toLowerCase();

    if (risk.includes("high")) {
      return "bg-red-100 text-red-700";
    }

    if (risk.includes("medium")) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (risk.includes("low")) {
      return "bg-green-100 text-green-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  function getPriorityClass(priority: string) {
    const value = priority.toLowerCase();

    if (value.includes("high")) {
      return "bg-red-100 text-red-700";
    }

    if (value.includes("medium")) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (value.includes("low")) {
      return "bg-green-100 text-green-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  function formatProbability(value: number) {
    return `${(value * 100).toFixed(2)}%`;
  }

  if (loading) {
    return (
      <p className="text-gray-600">
        Loading student profile...
      </p>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/teacher/students")}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <FiArrowLeft />
          Back to students
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
            {error}
          </p>
        </div>
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

  const latestAcademicRecord =
    profile.academic_records[0] ?? null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/teacher/students")}
          className="mb-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <FiArrowLeft />
          Back to students
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          Student Profile
        </h1>

        <p className="mt-2 text-gray-500">
          View academic performance, risk prediction,
          recommendations and interventions.
        </p>
      </div>

      {/* Student Information */}
      <section className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <FiUser size={26} />

          <h2 className="text-xl font-semibold text-gray-900">
            Student Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-sm text-gray-500">
              Student ID
            </p>

            <p className="mt-1 font-semibold">
              {profile.student.id}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Roll Number
            </p>

            <p className="mt-1 font-semibold">
              {profile.student.roll_number}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Department
            </p>

            <p className="mt-1 font-semibold">
              {profile.student.department}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Semester
            </p>

            <p className="mt-1 font-semibold">
              Semester {profile.student.semester}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Phone
            </p>

            <p className="mt-1 flex items-center gap-2 font-semibold">
              <FiPhone />
              {profile.student.phone || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Parent Email
            </p>

            <p className="mt-1 flex items-center gap-2 break-all font-semibold">
              <FiMail />
              {profile.student.parent_email || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Enrollment Year
            </p>

            <p className="mt-1 flex items-center gap-2 font-semibold">
              <FiCalendar />
              {profile.student.enrollment_year}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="mt-1 flex items-center gap-2 font-semibold text-green-700">
              <FiCheckCircle />
              {profile.student.status}
            </p>
          </div>
        </div>
      </section>

      {/* Academic Summary */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Academic Summary
        </h2>

        {latestAcademicRecord ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Attendance"
              value={`${latestAcademicRecord.attendance}%`}
              icon={<FiClipboard size={30} />}
            />

            <StatCard
              title="Internal Marks"
              value={latestAcademicRecord.internal_marks}
              icon={<FiBookOpen size={30} />}
            />

            <StatCard
              title="Assignment Score"
              value={latestAcademicRecord.assignment_score}
              icon={<FiClipboard size={30} />}
            />

            <StatCard
              title="Quiz Score"
              value={latestAcademicRecord.quiz_score}
              icon={<FiTrendingUp size={30} />}
            />

            <StatCard
              title="Previous GPA"
              value={latestAcademicRecord.previous_gpa}
              icon={<FiTrendingUp size={30} />}
            />
          </div>
        ) : (
          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-gray-500">
              No academic records available.
            </p>
          </div>
        )}
      </section>

      {/* Prediction */}
      <section className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-5 text-xl font-semibold text-gray-900">
          Latest Prediction
        </h2>

        {profile.latest_prediction ? (
          <div className="space-y-6">
            <span
              className={`inline-flex rounded-full px-4 py-2 font-medium ${getRiskClass(
                profile.latest_prediction.risk_level,
              )}`}
            >
              <FiAlertTriangle className="mr-2" />
              {profile.latest_prediction.risk_level}
            </span>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-5">
                <p className="text-sm text-gray-500">
                  Low Risk Probability
                </p>

                <p className="mt-2 text-2xl font-bold text-green-700">
                  {formatProbability(
                    profile.latest_prediction
                      .low_probability,
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-5">
                <p className="text-sm text-gray-500">
                  Medium Risk Probability
                </p>

                <p className="mt-2 text-2xl font-bold text-yellow-700">
                  {formatProbability(
                    profile.latest_prediction
                      .medium_probability,
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-5">
                <p className="text-sm text-gray-500">
                  High Risk Probability
                </p>

                <p className="mt-2 text-2xl font-bold text-red-700">
                  {formatProbability(
                    profile.latest_prediction
                      .high_probability,
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">
            No prediction available.
          </p>
        )}
      </section>

      {/* Recommendation */}
      <section className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-5 text-xl font-semibold text-gray-900">
          Latest Recommendation
        </h2>

        {profile.latest_recommendation ? (
          <div className="rounded-lg border border-gray-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {profile.latest_recommendation.title}
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityClass(
                  profile.latest_recommendation.priority,
                )}`}
              >
                {profile.latest_recommendation.priority}
              </span>
            </div>

            <p className="mt-4 text-gray-600">
              {profile.latest_recommendation.description}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">
            No recommendation available.
          </p>
        )}
      </section>

      {/* Interventions */}
      <section className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-5 text-xl font-semibold text-gray-900">
          Intervention History
        </h2>

        {profile.interventions.length === 0 ? (
          <p className="text-gray-500">
            No interventions available.
          </p>
        ) : (
          <div className="space-y-4">
            {profile.interventions.map((intervention) => (
              <div
                key={intervention.id}
                className="rounded-lg border border-gray-200 p-5"
              >
                <p className="font-semibold text-gray-900">
                  {intervention.action_taken}
                </p>

                <p className="mt-2 text-gray-600">
                  {intervention.remarks}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  Intervention ID: {intervention.id}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TeacherStudentProfilePage;