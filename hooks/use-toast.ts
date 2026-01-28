"use client";

import type React from "react";
import toast from "react-hot-toast";

export type ToastType = "success" | "error" | "loading" | "default";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

// Wrapper function to match the existing API
export function useToast(): {
  toast: (options: ToastOptions) => string;
  dismiss: (toastId?: string) => void;
} {
  const showToast = ({
    title,
    description,
    variant,
    duration,
  }: ToastOptions): string => {
    // Format message with title and description
    const message = description
      ? `${title || ""}\n${description}`.trim()
      : title || description || "";
    // Stable ID so React StrictMode double-invocation doesn't show duplicates
    const baseType = variant === "destructive" ? "error" : "success";
    const toastId = `${baseType}-${message}`;

    const toastOptions = {
      duration: duration || (variant === "destructive" ? 4000 : 3000),
      style: {
        padding: "12px 16px",
        borderRadius: "8px",
        background: variant === "destructive" ? "#ef4444" : "#10b981",
        backgroundColor: variant === "destructive" ? "#ef4444" : "#10b981",
        color: "#ffffff",
        border: "none",
        boxShadow:
          variant === "destructive"
            ? "0 4px 12px rgba(239, 68, 68, 0.3)"
            : "0 4px 12px rgba(16, 185, 129, 0.3)",
        maxWidth: "400px",
        minWidth: "300px",
        whiteSpace: "pre-line" as const,
        lineHeight: "1.5",
        opacity: "1",
      } as React.CSSProperties,
      iconTheme: {
        primary: "#ffffff",
        secondary: variant === "destructive" ? "#ef4444" : "#10b981",
      },
      className: variant === "destructive" ? "error-toast" : "success-toast",
      id: toastId,
    };

    if (variant === "destructive") {
      return toast.error(message, toastOptions);
    }

    return toast.success(message, toastOptions);
  };

  return {
    toast: showToast,
    dismiss: toast.dismiss,
  };
}

// Direct toast function for convenience
export const toastDirect = {
  success: (message: string, options?: { duration?: number }) =>
    toast.success(message, {
      duration: options?.duration || 3000,
      style: {
        borderLeft: "4px solid hsl(142, 76%, 36%)",
      },
      id: `direct-success-${message}`,
      ...options,
    }),
  error: (message: string, options?: { duration?: number }) =>
    toast.error(message, {
      duration: options?.duration || 4000,
      style: {
        borderLeft: "4px solid hsl(0, 84%, 60%)",
      },
      id: `direct-error-${message}`,
      ...options,
    }),
  loading: (message: string, options?: { duration?: number }) =>
    toast.loading(message, {
      duration: options?.duration || Infinity,
      style: {
        borderLeft: "4px solid hsl(var(--primary))",
      },
      id: `direct-loading-${message}`,
      ...options,
    }),
  default: (message: string, options?: { duration?: number }) =>
    toast(message, {
      duration: options?.duration || 4000,
      id: `direct-default-${message}`,
      ...options,
    }),
};

// Export toast for direct use
export { toast };
