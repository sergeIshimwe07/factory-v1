"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/components/ui/toast";

// ─── Light mode tokens ────────────────────────────────────────────────────────
const T = {
  gold:       "#B5611F",
  goldLight:  "#C2622D",
  goldDim:    "rgba(181,97,31,0.08)",
  goldBorder: "rgba(181,97,31,0.20)",
  bg:         "#F5F2EE",
  surface:    "#FFFFFF",
  surface2:   "#F9F7F4",
  surface3:   "#F0EDE8",
  border:     "rgba(0,0,0,0.07)",
  text:       "#1C1917",
  textDim:    "#78716C",
  textMuted:  "#A8A29E",
  red:        "#DC2626",
  redDim:     "rgba(220,38,38,0.08)",
} as const;

const fonts = {
  display: "'Cormorant Garamond', serif",
  mono:    "'DM Mono', monospace",
  body:    "'Outfit', sans-serif",
};

// ─── Schema ───────────────────────────────────────────────────────────────────
const productSchema = z.object({
  name:            z.string().min(1, "Name is required"),
  category:        z.string().min(1, "Category is required"),
  unit:            z.string().min(1, "Unit is required"),
  costPrice:       z.number().min(0, "Must be ≥ 0"),
  basePrice:       z.number().min(0, "Must be ≥ 0"),
  minimumPrice:    z.number().min(0, "Must be ≥ 0"),
  minimumStock:    z.number().min(0, "Must be ≥ 0"),
  commissionType:  z.string().optional(),
  commissionValue: z.number().min(0).optional(),
});

type ProductForm = z.infer<typeof productSchema>;

// ─── Primitives ───────────────────────────────────────────────────────────────
function LuxField({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{
        display: "block", fontFamily: fonts.mono, fontSize: "0.58rem",
        letterSpacing: "0.15em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.4rem",
      }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", color: T.red, marginTop: "0.3rem", letterSpacing: "0.05em" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function LuxInput({
  placeholder, type = "text", step, readOnly, registerProps,
}: {
  placeholder?: string; type?: string; step?: string; readOnly?: boolean;
  registerProps?: object;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} placeholder={placeholder} step={step} readOnly={readOnly}
      {...registerProps}
      onFocus={(e) => { setFocused(true); (registerProps as any)?.onFocus?.(e); }}
      onBlur={(e)  => { setFocused(false); (registerProps as any)?.onBlur?.(e); }}
      style={{
        width:      "100%",
        background: readOnly ? T.surface3 : T.surface,
        border:     `1px solid ${focused ? T.goldBorder : T.border}`,
        color:      T.text,
        fontFamily: fonts.mono,
        fontSize:   "0.78rem",
        padding:    "0.55rem 0.75rem",
        outline:    "none",
        transition: "border-color 0.15s",
      }}
    />
  );
}

function LuxSelect({ registerProps, children }: { registerProps?: object; children: React.ReactNode }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...registerProps}
      onFocus={(e) => { setFocused(true); (registerProps as any)?.onFocus?.(e); }}
      onBlur={(e)  => { setFocused(false); (registerProps as any)?.onBlur?.(e); }}
      style={{
        width:      "100%",
        background: T.surface,
        border:     `1px solid ${focused ? T.goldBorder : T.border}`,
        color:      T.text,
        fontFamily: fonts.mono,
        fontSize:   "0.78rem",
        padding:    "0.55rem 0.75rem",
        outline:    "none",
        transition: "border-color 0.15s",
        appearance: "none",
        backgroundImage:    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A8A29E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat:   "no-repeat",
        backgroundPosition: "right 0.75rem center",
        paddingRight:       "2rem",
        cursor:             "pointer",
      }}
    >
      {children}
    </select>
  );
}

function LuxButton({
  children, type = "button", variant = "primary", onClick, disabled, isLoading,
}: {
  children: React.ReactNode; type?: "button" | "submit" | "reset";
  variant?: "primary" | "outline"; onClick?: () => void;
  disabled?: boolean; isLoading?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background:  disabled ? T.surface3 : hovered ? "rgba(181,97,31,0.18)" : T.goldDim,
      borderColor: disabled ? T.border    : hovered ? T.gold               : T.goldBorder,
      color:       disabled ? T.textMuted : T.gold,
    },
    outline: {
      background:  hovered ? T.surface2 : "transparent",
      borderColor: hovered ? "rgba(0,0,0,0.15)" : T.border,
      color:       hovered ? T.text : T.textDim,
    },
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || isLoading}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
        padding: "0.55rem 1.4rem", border: "1px solid transparent",
        fontFamily: fonts.mono, fontSize: "0.62rem", letterSpacing: "0.12em",
        textTransform: "uppercase", cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s", opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap",
        ...styles[variant],
      }}
    >
      {isLoading ? (
        <span style={{ display: "inline-block", width: 12, height: 12, border: `1.5px solid currentColor`, borderTopColor: "transparent", borderRadius: "50%", animation: "lux-spin 0.6s linear infinite" }} />
      ) : children}
    </button>
  );
}

function SectionCard({
  title, subtitle, index, children,
}: {
  title: string; subtitle?: string; index: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderTop: `2px solid ${T.gold}`, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}`, background: T.surface }}>
        {/* Index number */}
        <span style={{ fontFamily: fonts.display, fontSize: "2rem", fontWeight: 600, color: T.surface3, lineHeight: 1, userSelect: "none", flexShrink: 0 }}>
          {index}
        </span>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.gold, display: "inline-block" }} />
            <h2 style={{ fontFamily: fonts.display, fontSize: "1.15rem", fontWeight: 500, color: T.text, lineHeight: 1 }}>
              {title}
            </h2>
          </div>
          {subtitle && (
            <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", letterSpacing: "0.1em", color: T.textMuted, marginTop: "0.25rem" }}>
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

function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
      {children}
    </div>
  );
}

function Grid3({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CreateProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { costPrice: 0, basePrice: 0, minimumPrice: 0, minimumStock: 0 },
  });

  const mutation = useMutation({
    mutationFn: (data: ProductForm) => api.post("/products", data),
    onSuccess: () => {
      toast({ title: "Product created successfully!", variant: "success" });
      router.push("/inventory/products");
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "error" });
    },
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');
        @keyframes lux-spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .lux-grid-2, .lux-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: fonts.body, color: T.text, padding: "2rem 2rem 4rem" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* ── Page Header ── */}
          <div style={{ position: "relative", paddingBottom: "1.75rem", borderBottom: `1px solid ${T.border}`, marginBottom: "2rem" }}>
            <span style={{ position: "absolute", bottom: -1, left: 0, width: 96, height: 1, background: T.gold }} />
            <p style={{ fontFamily: fonts.mono, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, marginBottom: "0.5rem" }}>
              Inventory
            </p>
            <h1 style={{ fontFamily: fonts.display, fontSize: "2.75rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: T.text }}>
              Create Product
            </h1>
            <p style={{ marginTop: "0.4rem", fontSize: "0.8rem", color: T.textMuted, fontWeight: 300, fontFamily: fonts.mono, letterSpacing: "0.04em" }}>
              Add a new product to your inventory
            </p>
          </div>

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* ── 01 Product Information ── */}
              <SectionCard title="Product Information" subtitle="Basic identification details" index="01">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }} className="lux-grid-2">
                  <LuxField label="Product Name" error={errors.name?.message}>
                    <LuxInput placeholder="Enter product name" registerProps={register("name")} />
                  </LuxField>
                  <LuxField label="Category" error={errors.category?.message}>
                    <LuxInput placeholder="e.g. Raw Material" registerProps={register("category")} />
                  </LuxField>
                </div>
                <LuxField label="Unit" error={errors.unit?.message}>
                  <div style={{ maxWidth: 200 }}>
                    <LuxInput placeholder="e.g. kg, pcs, liter" registerProps={register("unit")} />
                  </div>
                </LuxField>
              </SectionCard>

              {/* ── 02 Pricing ── */}
              <SectionCard title="Pricing" subtitle="Cost, sale and floor prices" index="02">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }} className="lux-grid-3">
                  <LuxField label="Cost Price" error={errors.costPrice?.message}>
                    <LuxInput type="number" step="0.01" registerProps={register("costPrice", { valueAsNumber: true })} />
                  </LuxField>
                  <LuxField label="Base Price" error={errors.basePrice?.message}>
                    <LuxInput type="number" step="0.01" registerProps={register("basePrice", { valueAsNumber: true })} />
                  </LuxField>
                  <LuxField label="Minimum Price" error={errors.minimumPrice?.message}>
                    <LuxInput type="number" step="0.01" registerProps={register("minimumPrice", { valueAsNumber: true })} />
                  </LuxField>
                </div>

                {/* Pricing hint row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", paddingTop: "0.25rem" }}>
                  {["What you pay", "Default sale price", "Floor — never sell below"].map((hint) => (
                    <p key={hint} style={{ fontFamily: fonts.mono, fontSize: "0.56rem", letterSpacing: "0.06em", color: T.textMuted }}>
                      {hint}
                    </p>
                  ))}
                </div>
              </SectionCard>

              {/* ── 03 Stock Settings ── */}
              <SectionCard title="Stock Settings" subtitle="Threshold for low-stock alerts" index="03">
                <LuxField label="Minimum Stock Level" error={errors.minimumStock?.message}>
                  <div style={{ maxWidth: 260 }}>
                    <LuxInput
                      type="number"
                      placeholder="Alert when stock falls below this"
                      registerProps={register("minimumStock", { valueAsNumber: true })}
                    />
                  </div>
                </LuxField>
                <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", letterSpacing: "0.06em", color: T.textMuted, marginTop: "-0.25rem" }}>
                  A low-stock alert will appear on the dashboard when current stock drops below this value.
                </p>
              </SectionCard>

              {/* ── 04 Commission ── */}
              <SectionCard title="Commission Rule" subtitle="Optional — leave blank to skip" index="04">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }} className="lux-grid-2">
                  <LuxField label="Type">
                    <LuxSelect registerProps={register("commissionType")}>
                      <option value="">No commission</option>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </LuxSelect>
                  </LuxField>
                  <LuxField label="Value">
                    <LuxInput
                      type="number" step="0.01"
                      placeholder="Commission value"
                      registerProps={register("commissionValue", { valueAsNumber: true })}
                    />
                  </LuxField>
                </div>
              </SectionCard>

              {/* ── Actions ── */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.25rem" }}>
                <LuxButton variant="outline" onClick={() => router.back()}>Cancel</LuxButton>
                <LuxButton type="submit" isLoading={mutation.isPending}>Create Product</LuxButton>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}