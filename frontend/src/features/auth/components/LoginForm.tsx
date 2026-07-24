import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

import { loginSchema } from "../schemas/loginSchema";
import type { LoginRequest } from "../types/auth";

import { login, getCurrentUser } from "../services/authService";
import { useAuth } from "../context/useAuth";
import axios from "axios";

function LoginForm() {
  const navigate = useNavigate();
  const { login: saveUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginRequest) {
    try {
      // Login API
      const loginResponse = await login(data);

      // Get logged-in user
      const user = await getCurrentUser(loginResponse.access_token);

      // Save to AuthContext
      saveUser(user, loginResponse.access_token);

      // Redirect according to role
      switch (user.role) {
        case "Admin":
          navigate("/admin");
          break;

        case "Teacher":
          navigate("/teacher");
          break;

        case "Student":
          navigate("/student");
          break;

        default:
          alert("Unknown user role.");
      }
    }
    catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data);

        alert(
          error.response?.data?.detail ??
          "Login failed."
        );
      } else {
        console.error(error);
        alert("Something went wrong.");
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div>
        <Input
          type="email"
          placeholder="Enter your email"
          {...register("email")}
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Enter your password"
          {...register("password")}
        />

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
      >
        Login
      </Button>
    </form>
  );
}

export default LoginForm;