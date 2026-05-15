"use client";

import { createContext, useCallback, useContext, useState } from "react";
import {
  Toast, ToastProvider, ToastViewport, ToastClose, ToastTitle, ToastDescription,
} from "@/components/ui/toast";

type ToastVariant = "default" | "success" | "destructive" | "warning";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ShowToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  show: (input: ShowToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastCtx = createContext<ToastContextValue | null>(null);

const MAX_VISIBLE = 4;

export function ToastRoot({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((input: ShowToastInput) => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => {
      const next = [
        ...prev,
        {
          id,
          title: input.title,
          description: input.description,
          variant: input.variant ?? "default",
          duration: input.duration ?? 4000,
        },
      ];
      // 최대 MAX_VISIBLE개만 유지 — 초과 시 가장 오래된 것 제거
      if (next.length > MAX_VISIBLE) {
        return next.slice(next.length - MAX_VISIBLE);
      }
      return next;
    });
  }, []);

  const value: ToastContextValue = {
    show,
    success: (title, description) => show({ title, description, variant: "success" }),
    error: (title, description) => show({ title, description, variant: "destructive" }),
    warning: (title, description) => show({ title, description, variant: "warning" }),
  };

  return (
    <ToastCtx.Provider value={value}>
      <ToastProvider>
        {children}
        {items.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            duration={t.duration}
            onOpenChange={(open) => { if (!open) remove(t.id); }}
          >
            <div className="flex-1 min-w-0">
              <ToastTitle>{t.title}</ToastTitle>
              {t.description && <ToastDescription className="mt-0.5">{t.description}</ToastDescription>}
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastRoot>");
  return ctx;
}
