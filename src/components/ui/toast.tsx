"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastVariant = "default" | "success" | "error" | "warning";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: (opts: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// Luxury design tokens
const T = {
  gold: "#B5611F",
  goldLight: "#C2622D",
  goldDim: "rgba(181,97,31,0.08)",
  goldBorder: "rgba(181,97,31,0.20)",
  surface: "#FFFFFF",
  surface2: "#F9F7F4",
  border: "rgba(0,0,0,0.07)",
  text: "#1C1917",
  textDim: "#78716C",
  textMuted: "#A8A29E",
  red: "#DC2626",
  green: "#059669",
  amber: "#D97706",
  blue: "#2563EB",
};

const fonts = {
  display: "'Cormorant Garamond', serif",
  mono: "'DM Mono', monospace",
  body: "'Outfit', sans-serif",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...opts, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const variantStyles: Record<ToastVariant, { icon: React.ReactNode; accentColor: string; bgColor: string; iconColor: string }> = {
    default: {
      icon: <Info size={18} />,
      accentColor: T.blue,
      bgColor: "rgba(37, 99, 235, 0.05)",
      iconColor: T.blue,
    },
    success: {
      icon: <CheckCircle2 size={18} />,
      accentColor: T.green,
      bgColor: "rgba(5, 150, 105, 0.05)",
      iconColor: T.green,
    },
    error: {
      icon: <AlertCircle size={18} />,
      accentColor: T.red,
      bgColor: "rgba(220, 38, 38, 0.05)",
      iconColor: T.red,
    },
    warning: {
      icon: <AlertTriangle size={18} />,
      accentColor: T.amber,
      bgColor: "rgba(217, 119, 6, 0.05)",
      iconColor: T.amber,
    },
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');
        
        @keyframes lux-toast-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes lux-toast-out {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }

        .lux-toast {
          animation: lux-toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          maxWidth: "420px",
          width: "100%",
        }}
      >
        {toasts.map((t) => {
          const style = variantStyles[t.variant];
          return (
            <div
              key={t.id}
              className="lux-toast"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderLeft: `3px solid ${style.accentColor}`,
                padding: "1rem 1.25rem",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
                backdropFilter: "blur(8px)",
                fontFamily: fonts.body,
                overflow: "hidden",
              }}
            >
              {/* Accent background */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: style.bgColor,
                  pointerEvents: "none",
                }}
              />

              {/* Content */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  flexShrink: 0,
                  color: style.iconColor,
                }}
              >
                {style.icon}
              </div>

              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: fonts.body,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: T.text,
                    lineHeight: 1.4,
                    marginBottom: t.description ? "0.25rem" : 0,
                  }}
                >
                  {t.title}
                </p>
                {t.description && (
                  <p
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: "0.75rem",
                      color: T.textDim,
                      lineHeight: 1.5,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {t.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                  border: "none",
                  background: "transparent",
                  color: T.textMuted,
                  cursor: "pointer",
                  transition: "color 0.15s",
                  flexShrink: 0,
                  padding: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
