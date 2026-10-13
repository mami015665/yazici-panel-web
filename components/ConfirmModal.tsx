"use client";

import { AlertCircle, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger" | "warning" | "success";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANTS = {
  primary: { color: "#f97316", icon: AlertCircle },
  danger: { color: "#ef4444", icon: XCircle },
  warning: { color: "#f59e0b", icon: AlertTriangle },
  success: { color: "#10b981", icon: CheckCircle2 },
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Onayla",
  cancelText = "İptal",
  variant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const v = VARIANTS[variant];
  const Icon = v.icon;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6 flex flex-col items-center gap-4 animate-fade-in"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: v.color + "22" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: v.color }}
          >
            <Icon size={22} color="white" strokeWidth={2.5} />
          </div>
        </div>

        <h3
          className="text-[18px] font-extrabold text-center"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h3>

        {message && (
          <p
            className="text-[14px] text-center leading-relaxed whitespace-pre-line"
            style={{ color: "var(--text-muted)" }}
          >
            {message}
          </p>
        )}

        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold text-[14px] transition-all"
            style={{
              background: "var(--bg-subtle)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold text-[14px] transition-all text-white"
            style={{
              background: v.color,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}