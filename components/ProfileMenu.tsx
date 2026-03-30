"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

type ProfileMenuProps = {
  name?: string;
  email: string;
  onLogout: () => void;
};

export function ProfileMenu({ name, email, onLogout }: ProfileMenuProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const logoutButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();
  const displayName = name?.trim() || email;
  const avatarLabel = (name?.trim() || email).charAt(0).toUpperCase();

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }

      setIsDropdownOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      logoutButtonRef.current?.focus();
    }, 20);

    return () => window.clearTimeout(timer);
  }, [isDropdownOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isDropdownOpen}
        aria-controls={menuId}
        onClick={() => setIsDropdownOpen((current) => !current)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:border-green-400/25 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-green-500/40"
      >
        {avatarLabel}
      </button>

      <AnimatePresence>
        {isDropdownOpen ? (
          <motion.div
            id={menuId}
            ref={menuRef}
            role="menu"
            aria-label="Profile menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+0.6rem)] z-40 w-64 rounded-[20px] border border-white/10 bg-[#08101d]/96 p-2 shadow-[0_22px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <div className="rounded-[16px] px-3 py-2.5">
              <p className="truncate text-sm font-medium text-white">
                {displayName}
              </p>
              {name?.trim() ? (
                <p className="mt-1 truncate text-xs text-[var(--muted)]">
                  {email}
                </p>
              ) : null}
            </div>

            <div className="my-1 border-t border-white/8" />

            <button
              ref={logoutButtonRef}
              type="button"
              role="menuitem"
              onClick={() => {
                setIsDropdownOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2.5 text-left text-sm text-[#f3f4f6] transition hover:bg-white/[0.06] focus:bg-white/[0.06] focus:outline-none"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-[var(--muted)]"
                aria-hidden="true"
              >
                <path d="M8 4.5H5.75C4.78 4.5 4 5.28 4 6.25V13.75C4 14.72 4.78 15.5 5.75 15.5H8" />
                <path d="M11.5 6.5L15 10L11.5 13.5" />
                <path d="M8.5 10H15" />
              </svg>
              Logout
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
