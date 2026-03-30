"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthUser = {
  id: string;
  name?: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

type SignupInput = {
  name?: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  bootstrapped: boolean;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
  signup: (input: SignupInput) => Promise<AuthUser>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  const request = useCallback(async function request<T>(
    path: string,
    init: RequestInit,
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const message = parseErrorMessage(errorText);

      throw new Error(message);
    }

    return response.json() as Promise<T>;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const payload = await request<{ user: AuthUser }>("/auth/me", {
        method: "GET",
      });
      setCurrentUser(payload.user);
      return payload.user;
    } catch {
      setCurrentUser(null);
      return null;
    }
  }, [request]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      await refresh();

      if (isMounted) {
        setBootstrapped(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  const signup = useCallback(async (input: SignupInput) => {
    const payload = await request<{ user: AuthUser }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setCurrentUser(payload.user);
    return payload.user;
  }, [request]);

  const login = useCallback(async (input: LoginInput) => {
    const payload = await request<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setCurrentUser(payload.user);
    return payload.user;
  }, [request]);

  const logout = useCallback(async () => {
    await request<{ success: true }>("/auth/logout", {
      method: "POST",
    });
    setCurrentUser(null);
  }, [request]);

  const value = useMemo<AuthContextValue>(
    () => ({
      bootstrapped,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      logout,
      refresh,
      signup,
    }),
    [bootstrapped, currentUser, login, logout, refresh, signup],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function parseErrorMessage(errorText: string) {
  try {
    const parsed = JSON.parse(errorText) as { message?: string | string[] };
    const message = Array.isArray(parsed.message)
      ? parsed.message.join(", ")
      : parsed.message;

    return message || "Request failed.";
  } catch {
    return errorText || "Request failed.";
  }
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return value;
}
