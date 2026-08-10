import axios from "axios";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "../types/auth";

import {
  getCurrentUser,
} from "../services/authService";

import { AuthContext } from "./authContext";

interface Props {
  children: ReactNode;
}

const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "user";

function normalizeRole(
  role: string,
): User["role"] {
  const normalizedRole = role
    .trim()
    .toLowerCase();

  if (normalizedRole === "admin") {
    return "Admin";
  }

  if (normalizedRole === "teacher") {
    return "Teacher";
  }

  if (normalizedRole === "student") {
    return "Student";
  }

  throw new Error(
    `Unsupported user role: ${role}`,
  );
}

function normalizeUser(
  user: User,
): User {
  return {
    ...user,
    role: normalizeRole(
      String(user.role),
    ),
  };
}

function getStoredUser(): User | null {
  const storedUser = localStorage.getItem(
    USER_STORAGE_KEY,
  );

  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(
      storedUser,
    ) as User;

    return normalizeUser(parsedUser);
  } catch (error) {
    console.error(
      "Failed to read stored user:",
      error,
    );

    localStorage.removeItem(
      USER_STORAGE_KEY,
    );

    return null;
  }
}

export function AuthProvider({
  children,
}: Props) {
  const [user, setUser] =
    useState<User | null>(
      getStoredUser,
    );

  const [token, setToken] =
    useState<string | null>(
      () =>
        localStorage.getItem(
          TOKEN_STORAGE_KEY,
        ),
    );

  const [
    isInitializing,
    setIsInitializing,
  ] = useState(true);

  function login(
    authenticatedUser: User,
    accessToken: string,
  ) {
    const normalizedUser =
      normalizeUser(
        authenticatedUser,
      );

    setUser(normalizedUser);
    setToken(accessToken);

    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      accessToken,
    );

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(
        normalizedUser,
      ),
    );
  }

  function logout() {
    setUser(null);
    setToken(null);

    localStorage.removeItem(
      TOKEN_STORAGE_KEY,
    );

    localStorage.removeItem(
      USER_STORAGE_KEY,
    );
  }

  useEffect(() => {
    let isMounted = true;

    async function restoreUser() {
      if (!token) {
        if (isMounted) {
          setUser(null);

          setIsInitializing(
            false,
          );
        }

        localStorage.removeItem(
          USER_STORAGE_KEY,
        );

        return;
      }

      try {
        const currentUser =
          await getCurrentUser(
            token,
          );

        const normalizedUser =
          normalizeUser(
            currentUser,
          );

        if (!isMounted) {
          return;
        }

        setUser(normalizedUser);

        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(
            normalizedUser,
          ),
        );
      } catch (error) {
        console.error(
          "Failed to restore user:",
          error,
        );

        if (
          axios.isAxiosError(
            error,
          ) &&
          (
            error.response?.status
              === 401
            || error.response?.status
              === 403
          )
        ) {
          localStorage.removeItem(
            TOKEN_STORAGE_KEY,
          );

          localStorage.removeItem(
            USER_STORAGE_KEY,
          );

          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsInitializing(
            false,
          );
        }
      }
    }

    void restoreUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}