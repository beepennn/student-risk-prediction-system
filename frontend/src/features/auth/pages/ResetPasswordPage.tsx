import axios from "axios";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLock,
} from "react-icons/fi";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";

import {
  resetPassword,
  validatePasswordResetToken,
} from "../services/authService";


type TokenStatus =
  | "checking"
  | "valid"
  | "invalid"
  | "success";


function ResetPasswordPage() {
  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token")?.trim()
    ?? "";

  const [tokenStatus, setTokenStatus] =
    useState<TokenStatus>("checking");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    let cancelled = false;

    async function verifyResetLink() {
      if (!token) {
        setError(
          "The password-reset link is missing "
          + "its security token."
        );

        setTokenStatus("invalid");
        return;
      }

      try {
        await validatePasswordResetToken(
          token,
        );

        if (!cancelled) {
          setTokenStatus("valid");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              requestError,
            ),
          );

          setTokenStatus("invalid");
        }
      }
    }

    void verifyResetLink();

    return () => {
      cancelled = true;
    };
  }, [token]);


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (tokenStatus !== "valid") {
      return;
    }

    const passwordError =
      validatePassword(
        newPassword,
      );

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (
      newPassword
      !== confirmPassword
    ) {
      setError(
        "Password confirmation does not match."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      await resetPassword(
        {
          token,
          new_password: newPassword,
          confirm_password:
            confirmPassword,
        },
      );

      setTokenStatus("success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      console.error(
        "Password-reset error:",
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


  if (tokenStatus === "checking") {
    return (
      <PageContainer>
        <Card>
          <div className="w-full max-w-md py-8 text-center sm:w-105">
            <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Checking Reset Link
            </h1>

            <p className="mt-2 text-slate-500">
              Please wait while the secure link
              is verified.
            </p>
          </div>
        </Card>
      </PageContainer>
    );
  }


  if (tokenStatus === "invalid") {
    return (
      <PageContainer>
        <Card>
          <div className="w-full max-w-md text-center sm:w-105">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FiAlertCircle size={27} />
            </div>

            <h1 className="mt-5 text-3xl font-bold text-slate-900">
              Invalid Reset Link
            </h1>

            <p className="mt-3 leading-7 text-slate-500">
              {error}
            </p>

            <Link
              to="/forgot-password"
              className="mt-7 flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Request a New Reset Link
            </Link>

            <Link
              to="/login"
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Return to Login
            </Link>
          </div>
        </Card>
      </PageContainer>
    );
  }


  if (tokenStatus === "success") {
    return (
      <PageContainer>
        <Card>
          <div className="w-full max-w-md text-center sm:w-105">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <FiCheckCircle size={28} />
            </div>

            <h1 className="mt-5 text-3xl font-bold text-slate-900">
              Password Updated
            </h1>

            <p className="mt-3 leading-7 text-slate-500">
              Your password was reset successfully.
              The reset link can no longer be used.
            </p>

            <Link
              to="/login"
              className="mt-7 flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Continue to Login
            </Link>
          </div>
        </Card>
      </PageContainer>
    );
  }


  const passwordRules = {
    length: newPassword.length >= 8,

    lowercase: /[a-z]/.test(
      newPassword,
    ),

    uppercase: /[A-Z]/.test(
      newPassword,
    ),

    number: /\d/.test(
      newPassword,
    ),
  };


  return (
    <PageContainer>
      <Card>
        <div className="w-full max-w-md sm:w-105">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FiKey size={27} />
            </div>

            <h1 className="mt-5 text-3xl font-bold text-slate-900">
              Reset Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create a strong new password for
              your account.
            </p>
          </div>

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

            <PasswordInput
              label="New Password"
              value={newPassword}
              showPassword={
                showNewPassword
              }
              disabled={loading}
              autoComplete="new-password"
              onChange={(value) => {
                setNewPassword(value);
                setError("");
              }}
              onToggleVisibility={() =>
                setShowNewPassword(
                  (current) => !current,
                )
              }
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              showPassword={
                showConfirmPassword
              }
              disabled={loading}
              autoComplete="new-password"
              onChange={(value) => {
                setConfirmPassword(value);
                setError("");
              }}
              onToggleVisibility={() =>
                setShowConfirmPassword(
                  (current) => !current,
                )
              }
            />

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Password requirements
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <PasswordRule
                  valid={
                    passwordRules.length
                  }
                  label="8 characters"
                />

                <PasswordRule
                  valid={
                    passwordRules.uppercase
                  }
                  label="Uppercase letter"
                />

                <PasswordRule
                  valid={
                    passwordRules.lowercase
                  }
                  label="Lowercase letter"
                />

                <PasswordRule
                  valid={
                    passwordRules.number
                  }
                  label="Number"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="flex w-full items-center justify-center gap-2"
              disabled={loading}
            >
              <FiLock />

              {loading
                ? "Updating Password..."
                : "Reset Password"}
            </Button>
          </form>
        </div>
      </Card>
    </PageContainer>
  );
}


function PageContainer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      {children}
    </div>
  );
}


function PasswordInput({
  label,
  value,
  showPassword,
  disabled,
  autoComplete,
  onChange,
  onToggleVisibility,
}: {
  label: string;
  value: string;
  showPassword: boolean;
  disabled: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <div className="relative">
        <FiLock
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />

        <Input
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          placeholder={label}
          autoComplete={autoComplete}
          disabled={disabled}
          className="pl-11 pr-12"
        />

        <button
          type="button"
          onClick={
            onToggleVisibility
          }
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
        >
          {showPassword ? (
            <FiEyeOff size={19} />
          ) : (
            <FiEye size={19} />
          )}
        </button>
      </div>
    </label>
  );
}


function PasswordRule({
  valid,
  label,
}: {
  valid: boolean;
  label: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${
        valid
          ? "text-green-700"
          : "text-slate-500"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          valid
            ? "bg-green-100"
            : "bg-slate-200"
        }`}
      >
        <FiCheck size={13} />
      </span>

      {label}
    </div>
  );
}


function validatePassword(
  password: string,
): string | null {
  if (password.length < 8) {
    return (
      "Password must contain at least "
      + "8 characters."
    );
  }

  if (!/[a-z]/.test(password)) {
    return (
      "Password must contain at least "
      + "one lowercase letter."
    );
  }

  if (!/[A-Z]/.test(password)) {
    return (
      "Password must contain at least "
      + "one uppercase letter."
    );
  }

  if (!/\d/.test(password)) {
    return (
      "Password must contain at least "
      + "one number."
    );
  }

  return null;
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

    if (
      Array.isArray(detail)
      && typeof detail[0]?.msg
        === "string"
    ) {
      return detail[0].msg.replace(
        /^Value error,\s*/i,
        "",
      );
    }

    if (!error.response) {
      return (
        "Cannot connect to the backend server."
      );
    }
  }

  return (
    "Unable to reset the password. "
    + "Please request a new link."
  );
}


export default ResetPasswordPage;