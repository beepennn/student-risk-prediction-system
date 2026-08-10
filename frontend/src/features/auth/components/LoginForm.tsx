import axios from "axios";

import {
  useState,
} from "react";

import {
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiLock,
  FiLogIn,
  FiMail,
  FiShield,
} from "react-icons/fi";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

import {
  useAuth,
} from "../context/useAuth";

import {
  loginSchema,
} from "../schemas/loginSchema";

import {
  getCurrentUser,
  login,
} from "../services/authService";

import type {
  LoginRequest,
} from "../types/auth";


interface LocationState {
  from?: string;
}


function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login: saveUser,
  } = useAuth();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loginError,
    setLoginError,
  ] = useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginRequest>({
    resolver: zodResolver(
      loginSchema,
    ),
    defaultValues: {
      email: "",
      password: "",
    },
  });


  async function onSubmit(
    data: LoginRequest,
  ) {
    try {
      setLoginError("");

      const loginResponse =
        await login(data);

      const user =
        await getCurrentUser(
          loginResponse.access_token,
        );

      saveUser(
        user,
        loginResponse.access_token,
      );

      const role =
        user.role
          .trim()
          .toLowerCase();

      let roleHome = "/login";

      if (role === "admin") {
        roleHome = "/admin";
      } else if (role === "teacher") {
        roleHome = "/teacher";
      } else if (role === "student") {
        roleHome = "/student";
      } else {
        setLoginError(
          "Your account has an unsupported role.",
        );

        return;
      }

      const locationState =
        location.state as LocationState | null;

      const previousPath =
        locationState?.from;

      const pathMatchesRole =
        previousPath === roleHome
        || previousPath?.startsWith(
          `${roleHome}/`,
        );

      navigate(
        pathMatchesRole && previousPath
          ? previousPath
          : roleHome,
        {
          replace: true,
        },
      );
    } catch (error) {
      console.error(
        "Login error:",
        error,
      );

      if (axios.isAxiosError(error)) {
        const detail =
          error.response?.data?.detail;

        if (typeof detail === "string") {
          setLoginError(detail);
          return;
        }

        if (!error.response) {
          setLoginError(
            "Cannot connect to the backend server. Please make sure the backend is running.",
          );

          return;
        }
      }

      setLoginError(
        "Login failed. Please check your email and password.",
      );
    }
  }


  return (
    <form
      onSubmit={handleSubmit(
        onSubmit,
      )}
      className="space-y-5"
      noValidate
    >
      {loginError && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle
            className="mt-0.5 shrink-0"
            size={18}
          />

          <p className="leading-6">
            {loginError}
          </p>
        </div>
      )}

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Email Address
        </span>

        <div className="relative">
          <FiMail
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={19}
          />

          <Input
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isSubmitting}
            className="pl-11"
            {...register("email")}
          />
        </div>

        {errors.email && (
          <p className="mt-2 text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </label>

      <label className="block">
        <div className="mb-2 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-slate-700">
            Password
          </span>

          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Forgot password?
          </Link>
        </div>

        <div className="relative">
          <FiLock
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={19}
          />

          <Input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isSubmitting}
            className="pl-11 pr-12"
            {...register("password")}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current,
              )
            }
            disabled={isSubmitting}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
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

        {errors.password && (
          <p className="mt-2 text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </label>

      <Button
        type="submit"
        className="w-full gap-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <FiLoader
              className="animate-spin"
              size={19}
            />

            Signing in...
          </>
        ) : (
          <>
            <FiLogIn size={19} />
            Sign In
          </>
        )}
      </Button>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex gap-3">
          <FiShield
            className="mt-0.5 shrink-0 text-blue-600"
            size={18}
          />

          <p className="text-sm leading-6 text-slate-500">
            Access is restricted according to
            your assigned Admin, Teacher or
            Student role.
          </p>
        </div>
      </div>
    </form>
  );
}


export default LoginForm;