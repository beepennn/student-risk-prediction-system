import axios from "axios";
import { useState } from "react";
import {
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

import { loginSchema } from "../schemas/loginSchema";

import type { LoginRequest } from "../types/auth";

import {
  getCurrentUser,
  login,
} from "../services/authService";

import { useAuth } from "../context/useAuth";

interface LocationState {
  from?: string;
}

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login: saveUser } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loginError, setLoginError] =
    useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginRequest) {
    try {
      setLoginError("");

      const loginResponse = await login(data);

      const user = await getCurrentUser(
        loginResponse.access_token,
      );

      saveUser(
        user,
        loginResponse.access_token,
      );

      const role = user.role.toLowerCase();

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

      const previousPath = locationState?.from;

      const previousPathMatchesRole =
        previousPath === roleHome ||
        previousPath?.startsWith(
          `${roleHome}/`,
        );

      navigate(
        previousPathMatchesRole && previousPath
          ? previousPath
          : roleHome,
        {
          replace: true,
        },
      );
    } catch (error) {
      console.error("Login error:", error);

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
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      {loginError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loginError}
        </div>
      )}

      <div>
        <Input
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          disabled={isSubmitting}
          {...register("email")}
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <div className="relative">
          <Input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isSubmitting}
            className="pr-12"
            {...register("password")}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (currentValue) =>
                  !currentValue,
              )
            }
            disabled={isSubmitting}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            title={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <FiEyeOff size={20} />
            ) : (
              <FiEye size={20} />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="mt-1 text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="text-right">
        <Link
          to="/forgot-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Logging in..."
          : "Login"}
      </Button>
    </form>
  );
}

export default LoginForm;