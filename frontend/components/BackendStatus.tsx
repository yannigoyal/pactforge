"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/apiUrl";

type Status = "checking" | "connected" | "offline";

export function BackendStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/health`)
      .then((res) => {
        if (!cancelled) setStatus(res.ok ? "connected" : "offline");
      })
      .catch(() => {
        if (!cancelled) setStatus("offline");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const color =
    status === "connected"
      ? "bg-emerald-500"
      : status === "offline"
        ? "bg-red-500"
        : "bg-slate-300 dark:bg-slate-600";

  return (
    <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      Backend: {status}
    </p>
  );
}
