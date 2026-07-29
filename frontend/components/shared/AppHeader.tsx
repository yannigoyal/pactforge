"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { BackendStatus } from "@/components/BackendStatus";

export function AppHeader() {
  const { email, isLoading, signOut } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base font-semibold text-slate-900 dark:text-slate-100">
            pactForge
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100">
              Templates
            </Link>
            <Link href="/documents" className="hover:text-slate-900 dark:hover:text-slate-100">
              My documents
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <BackendStatus />
          </div>
          {isLoading ? null : email ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden text-slate-600 sm:inline dark:text-slate-400">{email}</span>
              <button
                type="button"
                onClick={signOut}
                className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
