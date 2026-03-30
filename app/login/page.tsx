import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.14),transparent_24%),radial-gradient(circle_at_80%_14%,rgba(59,130,246,0.12),transparent_20%),linear-gradient(135deg,#0f172a_0%,#020617_58%,#020617_100%)]" />
      <AuthForm mode="login" />
    </main>
  );
}
