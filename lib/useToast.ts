"use client";

import { useState, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

// Basit global state (React context gerektirmez)
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toastList: Toast[] = [];

function emit() {
  toastListeners.forEach((l) => l([...toastList]));
}

export const toast = {
  success(title: string, message?: string) {
    push("success", title, message);
  },
  error(title: string, message?: string) {
    push("error", title, message);
  },
  info(title: string, message?: string) {
    push("info", title, message);
  },
  warning(title: string, message?: string) {
    push("warning", title, message);
  },
};

function push(type: ToastType, title: string, message?: string) {
  const id = Date.now() + Math.random();
  toastList = [...toastList, { id, type, title, message }];
  emit();

  setTimeout(() => {
    toastList = toastList.filter((t) => t.id !== id);
    emit();
  }, 3500);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  return toasts;
}