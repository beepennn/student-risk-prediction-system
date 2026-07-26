import { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiHash,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";

import { useAuth } from "../../auth/context/useAuth";

import { getStudentProfile } from "../services/studentProfileService";

import type { StudentProfile } from "../types/studentProfile";

function StudentProfilePage() {
  const { token } = useAuth();

  const [profile, setProfile] =
    useState<StudentProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const profileData =
          await getStudentProfile(token);

        setProfile(profileData);
      } catch (error) {
        console.error(
          "Student profile error:",
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
  }, [token]);

  if (loading) {
    return <p>Loading Student Profile...</p>;
  }

  if (error) {
    return (
      <p className="text-red-600">
        {error}
      </p>
    );
  }

  if (!profile) {
    return (
      <p>No student profile available.</p>
    );
  }

  const profileItems = [
    {
      label: "Student ID",
      value: profile.id,
      icon: <FiHash size={22} />,
    },
    {
      label: "User ID",
      value: profile.user_id,
      icon: <FiUser size={22} />,
    },
    {
      label: "Roll Number",
      value: profile.roll_number,
      icon: <FiHash size={22} />,
    },
    {
      label: "Department",
      value: profile.department,
      icon: <FiBookOpen size={22} />,
    },
    {
      label: "Semester",
      value: `Semester ${profile.semester}`,
      icon: <FiBookOpen size={22} />,
    },
    {
      label: "Phone",
      value: profile.phone || "N/A",
      icon: <FiPhone size={22} />,
    },
    {
      label: "Parent Email",
      value: profile.parent_email || "N/A",
      icon: <FiMail size={22} />,
    },
    {
      label: "Enrollment Year",
      value: profile.enrollment_year,
      icon: <FiCalendar size={22} />,
    },
    {
      label: "Status",
      value: profile.status,
      icon: <FiCheckCircle size={22} />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Student Profile
        </h1>

        <p className="mt-2 text-gray-500">
          View your academic and personal
          information.
        </p>
      </div>

      {/* Profile Header */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <FiUser size={38} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {profile.roll_number}
            </h2>

            <p className="mt-1 text-gray-500">
              {profile.department}
            </p>

            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                profile.status.toLowerCase() ===
                "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {profile.status}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Profile Details
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {profileItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-gray-200 p-5"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                  {item.icon}
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    {item.label}
                  </p>

                  <p className="mt-1 break-words font-semibold text-gray-900">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Information Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="font-semibold text-blue-900">
          Profile information
        </h3>

        <p className="mt-2 text-sm text-blue-700">
          Profile editing is not available
          because the backend currently provides
          only the student profile viewing
          endpoint.
        </p>
      </div>
    </div>
  );
}

export default StudentProfilePage;