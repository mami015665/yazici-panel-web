"use client";

import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToast } from "@/lib/useToast";

const CONFIG = {
  success: {
    icon: CheckCircle2,
    bg: "#10b981",
    border: "#34d399",
  },
  error: {
    icon: XCircle,
    bg: "#ef4444",
    border: "#f87171",
  },
  warning: {
    icon: AlertTriangle,
    bg: "#f59e0b",
    border: "#fbbf24",
  },
  info: {
    icon: Info,
    bg: "#3b82f6",
    border: "#60a5fa",
  },
};

export default function ToastContainer() {
  const toasts = useToast();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const cfg = CONFIG[t.type];
        const Icon = cfg.icon;
        return (
          <div
            key={t.id}
            className="animate-slide-in pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 min-w-[280px] max-w-[380px] shadow-lg border"
            style={{
              background: "var(--bg-elevated)",
              borderColor: cfg.border + "66",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: cfg.bg }}
            >
              <Icon size={16} color="white" strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-[13px] font-bold truncate"
                style={{ color: "var(--text)" }}
              >
                {t.title}
              </div>
              {t.message && (
                <div
                  className="text-[11px] mt-0.5 truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t.message}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}