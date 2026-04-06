import React, { useState } from "react";

// Type for react-hook-form register
type RegisterProps = Record<string, any>;

// ─── Design Tokens ────────────────────────────────────────────────────────────
export const luxTokens = {
  gold:        "#B5611F",
  goldLight:   "#C2622D",
  goldDim:     "rgba(181,97,31,0.08)",
  goldBorder:  "rgba(181,97,31,0.20)",
  bg:          "#F5F2EE",
  surface:     "#FFFFFF",
  surface2:    "#F9F7F4",
  surface3:    "#F0EDE8",
  border:      "rgba(0,0,0,0.07)",
  text:        "#1C1917",
  textDim:     "#78716C",
  textMuted:   "#A8A29E",
  red:         "#DC2626",
  redDim:      "rgba(220,38,38,0.08)",
  amber:       "#B45309",
  amberDim:    "rgba(180,83,9,0.08)",
  amberBorder: "rgba(180,83,9,0.20)",
} as const;

export const luxFonts = {
  display: "'Cormorant Garamond', serif",
  mono:    "'DM Mono', monospace",
  body:    "'Outfit', sans-serif",
} as const;

const T = luxTokens;
const fonts = luxFonts;

export function LuxField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: fonts.mono,
          fontSize: "0.58rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: T.textMuted,
          marginBottom: "0.4rem",
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          style={{
            fontFamily: fonts.mono,
            fontSize: "0.58rem",
            color: T.red,
            marginTop: "0.3rem",
            letterSpacing: "0.05em",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─── LuxInput ─────────────────────────────────────────────────────────────────
export function LuxInput({
  placeholder,
  type = "text",
  step,
  min,
  readOnly,
  registerProps,
}: {
  placeholder?: string;
  type?: string;
  step?: string;
  min?: number;
  readOnly?: boolean;
  registerProps?: RegisterProps;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      step={step}
      min={min}
      readOnly={readOnly}
      {...registerProps}
      onFocus={(e) => {
        setFocused(true);
        registerProps?.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        registerProps?.onBlur?.(e);
      }}
      style={{
        width: "100%",
        background: readOnly ? T.surface3 : T.surface,
        border: `1px solid ${focused ? T.goldBorder : T.border}`,
        color: T.text,
        fontFamily: fonts.mono,
        fontSize: "0.78rem",
        padding: "0.55rem 0.75rem",
        outline: "none",
        transition: "border-color 0.15s",
      }}
    />
  );
}

// ─── LuxSelect ────────────────────────────────────────────────────────────────
export function LuxSelect({
  registerProps,
  children,
  options,
  placeholder = "Select option",
}: {
  registerProps?: RegisterProps;
  children?: React.ReactNode;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <select
      {...registerProps}
      onFocus={(e) => {
        setFocused(true);
        registerProps?.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        registerProps?.onBlur?.(e);
      }}
      style={{
        width: "100%",
        background: T.surface,
        border: `1px solid ${focused ? T.goldBorder : T.border}`,
        color: T.text,
        fontFamily: fonts.mono,
        fontSize: "0.78rem",
        padding: "0.55rem 0.75rem",
        outline: "none",
        transition: "border-color 0.15s",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A8A29E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
        paddingRight: "2rem",
        cursor: "pointer",
      }}
    >
      <option value="">{placeholder}</option>
      {options
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        : children}
    </select>
  );
}

// ─── LuxButton ────────────────────────────────────────────────────────────────
export function LuxButton({
  children,
  type = "button",
  variant = "primary",
  onClick,
  disabled,
  isLoading,
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "outline";
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: disabled ? T.surface3 : hovered ? "rgba(181,97,31,0.18)" : T.goldDim,
      borderColor: disabled ? T.border : hovered ? T.gold : T.goldBorder,
      color: disabled ? T.textMuted : T.gold,
    },
    outline: {
      background: hovered ? T.surface2 : "transparent",
      borderColor: hovered ? "rgba(0,0,0,0.15)" : T.border,
      color: hovered ? T.text : T.textDim,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
        padding: "0.55rem 1.4rem",
        border: "1px solid transparent",
        fontFamily: fonts.mono,
        fontSize: "0.62rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        opacity: disabled ? 0.5 : 1,
        whiteSpace: "nowrap",
        ...styles[variant],
      }}
    >
      {isLoading ? (
        <span
          style={{
            display: "inline-block",
            width: 12,
            height: 12,
            border: `1.5px solid currentColor`,
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "lux-spin 0.6s linear infinite",
          }}
        />
      ) : (
        children
      )}
    </button>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────
export function SectionCard({
  title,
  subtitle,
  index,
  children,
  dot,
}: {
  title: string;
  subtitle?: string;
  index?: string;
  children: React.ReactNode;
  dot?: string;
}) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderTop: `2px solid ${dot || T.gold}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: index ? "1.25rem" : "0.6rem",
          padding: "1.25rem 1.5rem",
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
        }}
      >
        {index && (
          <span
            style={{
              fontFamily: fonts.display,
              fontSize: "2rem",
              fontWeight: 600,
              color: T.surface3,
              lineHeight: 1,
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            {index}
          </span>
        )}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: dot || T.gold,
                display: "inline-block",
              }}
            />
            <h2
              style={{
                fontFamily: fonts.display,
                fontSize: "1.15rem",
                fontWeight: 500,
                color: T.text,
                lineHeight: 1,
              }}
            >
              {title}
            </h2>
          </div>
          {subtitle && (
            <p
              style={{
                fontFamily: fonts.mono,
                fontSize: "0.58rem",
                letterSpacing: "0.1em",
                color: T.textMuted,
                marginTop: "0.25rem",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Layout Grids ─────────────────────────────────────────────────────────────
export function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }} className="lux-grid-2">
      {children}
    </div>
  );
}

export function Grid3({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }} className="lux-grid-3">
      {children}
    </div>
  );
}
