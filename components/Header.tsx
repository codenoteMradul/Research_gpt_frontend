"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { ProfileMenu } from "./ProfileMenu";

export function Header() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#08101d]/72 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Research Workspace
          </p>
          <h1 className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
            Mradul GPT
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-[var(--muted)] md:inline">
            {currentUser?.name?.trim() || currentUser?.email || "Account"}
          </span>
          <ProfileMenu
            name={currentUser?.name}
            email={currentUser?.email ?? "account"}
            onLogout={() => {
              void logout().then(() => {
                router.replace("/login");
                router.refresh();
              });
            }}
          />
        </div>
      </div>
    </header>
  );
}
