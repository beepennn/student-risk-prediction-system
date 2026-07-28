import axios from "axios";

import {
  useState,
  type FormEvent,
} from "react";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiMail,
  FiSend,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";

import {
  requestPasswordReset,
} from "../services/authService";


function ForgotPasswordPage() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Enter your email address."
      );

      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        normalizedEmail,
      )
    ) {
      setError(
        "Enter a valid email address."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response =
        await requestPasswordReset(
          {
            email: normalizedEmail,
          },
        );

      setSuccessMessage(
        response.message,
      );
    } catch (requestError) {
      console.error(
        "Forgot-password error:",
        requestError,
      );

      setError(
        getErrorMessage(
          requestError,
        ),
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <Card>
        <div className="w-full max-w-md sm:w-[420px]">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FiMail size={26} />
            </div>

            <h1 className="mt-5 text-3xl font-bold text-slate-900">
              Forgot Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter the email used to sign in.
              We will send a secure password-reset
              link when an active account exists.
            </p>
          </div>

          {successMessage ? (
            <div className="mt-7 space-y-5">
              <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-green-700">
                <div className="flex gap-3">
                  <FiCheckCircle
                    className="mt-0.5 shrink-0"
                    size={21}
                  />

                  <div>
                    <p className="font-semibold">
                      Check your email
                    </p>

                    <p className="mt-1 text-sm leading-6">
                      {successMessage}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-slate-500">
                The link expires after 30 minutes.
                Check the spam folder when the email
                is not visible.
              </p>

              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                <FiArrowLeft />
                Return to Login
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
              noValidate
            >
              {error && (
                <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <FiAlertCircle
                    className="mt-0.5 shrink-0"
                    size={18}
                  />

                  <p>{error}</p>
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Account Email
                </span>

                <div className="relative">
                  <FiMail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={19}
                  />

                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(
                        event.target.value,
                      );

                      setError("");
                    }}
                    placeholder="name@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="pl-11"
                  />
                </div>
              </label>

              <Button
                type="submit"
                className="flex w-full items-center justify-center gap-2"
                disabled={loading}
              >
                <FiSend />

                {loading
                  ? "Sending Link..."
                  : "Send Reset Link"}
              </Button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <FiArrowLeft />
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
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
      error.response.status === 422
    ) {
      return (
        "Enter a valid email address."
      );
    }
  }

  return (
    "Unable to request a password-reset "
    + "link. Please try again."
  );
}


export default ForgotPasswordPage;