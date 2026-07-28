import axios from "axios";

import {
  useState,
  type FormEvent,
} from "react";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiLoader,
  FiMail,
  FiRefreshCw,
  FiSend,
} from "react-icons/fi";

import {
  Link,
} from "react-router-dom";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

import AuthPageShell from "../components/AuthPageShell";

import {
  requestPasswordReset,
} from "../services/authService";


function ForgotPasswordPage() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Enter your email address.",
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
        "Enter a valid email address.",
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response =
        await requestPasswordReset({
          email: normalizedEmail,
        });

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


  function handleSendAnotherLink() {
    setSuccessMessage("");
    setError("");
  }


  return (
    <AuthPageShell
      icon={<FiMail size={27} />}
      title={
        successMessage
          ? "Check your email"
          : "Forgot your password?"
      }
      description={
        successMessage
          ? "Follow the secure link in your email to create a new password."
          : "Enter the email address associated with your account and we will send password-reset instructions."
      }
    >
      {successMessage ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                <FiCheckCircle
                  size={21}
                />
              </div>

              <div>
                <h3 className="font-semibold text-green-900">
                  Reset link requested
                </h3>

                <p className="mt-1 text-sm leading-6 text-green-700">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            The secure link expires after
            30 minutes. Check your spam or
            junk folder when the message is
            not visible.
          </div>

          <Link
            to="/login"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <FiArrowLeft />
            Return to Login
          </Link>

          <button
            type="button"
            onClick={
              handleSendAnotherLink
            }
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FiRefreshCw />
            Send Another Link
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
        >
          {error && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <FiAlertCircle
                className="mt-0.5 shrink-0"
                size={18}
              />

              <p className="leading-6">
                {error}
              </p>
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Account Email
            </span>

            <div className="relative">
              <FiMail
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Use the same email address
              registered with your account.
            </p>
          </label>

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <FiLoader
                  className="animate-spin"
                  size={19}
                />

                Sending Reset Link...
              </>
            ) : (
              <>
                <FiSend size={19} />
                Send Reset Link
              </>
            )}
          </Button>

          <Link
            to="/login"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FiArrowLeft />
            Back to Login
          </Link>
        </form>
      )}
    </AuthPageShell>
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