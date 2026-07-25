import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "../types/auth";
import { AuthContext } from "./authContext";
import { getCurrentUser } from "../services/authService";

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);

    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("token");
  };

  useEffect(() => {
    async function restoreUser() {
      if (!token) {
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to restore user:", error);

        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    }

    restoreUser();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}