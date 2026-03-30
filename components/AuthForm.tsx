"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { bootstrapped, isAuthenticated, login, signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  useEffect(() => {
    if (bootstrapped && isAuthenticated) {
      router.replace("/");
    }
  }, [bootstrapped, isAuthenticated, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (!isLogin && password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isLogin) {
        await login({
          email,
          password,
          rememberMe,
        });
      } else {
        await signup({
          name,
          email,
          password,
        });
      }

      router.replace("/");
      router.refresh();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Authentication failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="glass-panel w-full max-w-md rounded-[28px] border border-white/10 p-6 shadow-2xl shadow-black/30">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          {isLogin ? "Welcome Back" : "Create Account"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          {isLogin ? "Log in" : "Sign up"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {isLogin
            ? "Pick up your saved chats and continue where you left off."
            : "Create an account to save chats securely and access them across sessions."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin ? (
          <div className="space-y-2">
            <label className="text-sm text-[#d1d5db]" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Optional"
              className="w-full rounded-[16px] border border-white/10 bg-[#050816] px-4 py-3 text-sm text-white outline-none transition focus:border-green-400/50"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm text-[#d1d5db]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-[16px] border border-white/10 bg-[#050816] px-4 py-3 text-sm text-white outline-none transition focus:border-green-400/50"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-[#d1d5db]" htmlFor="password">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="text-xs text-[var(--muted)] transition hover:text-white"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isLogin ? "Enter your password" : "Minimum 8 characters"}
            className="w-full rounded-[16px] border border-white/10 bg-[#050816] px-4 py-3 text-sm text-white outline-none transition focus:border-green-400/50"
          />
        </div>

        {isLogin ? (
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-[#050816]"
            />
            Remember me
          </label>
        ) : null}

        {error ? (
          <p className="rounded-[16px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-[16px] bg-[#16a34a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#15803d] disabled:opacity-60"
        >
          {isSubmitting
            ? isLogin
              ? "Logging in..."
              : "Creating account..."
            : isLogin
              ? "Login"
              : "Sign up"}
        </button>
      </form>

      <p className="mt-5 text-sm text-[var(--muted)]">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-medium text-green-300 transition hover:text-green-200"
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
