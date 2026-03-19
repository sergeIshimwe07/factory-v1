"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, User, DollarSign } from "lucide-react";
import api from "@/lib/api";
import type { Sale, Customer } from "@/types";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/utils/formatters";

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
  green:      "#059669",
} as const;

const fonts = {
  display: "'Cormorant Garamond', serif",
  mono:    "'DM Mono', monospace",
  body:    "'Outfit', sans-serif",
};

// ─── Schema ───────────────────────────────────────────────────────────────────
const paymentSchema = z.object({
  saleId: z.string().min(1, "Select a sale/invoice"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum(["cash", "bank_transfer", "cheque", "mobile_money"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

// ─── Primitives ───────────────────────────────────────────────────────────────
function LuxField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
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

function LuxInput({ placeholder, type = "text", step, registerProps }: {
  placeholder?: string; type?: string; step?: string; registerProps?: object;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} placeholder={placeholder} step={step}
      {...registerProps}
      onFocus={(e) => { setFocused(true); (registerProps as any)?.onFocus?.(e); }}
      onBlur={(e)  => { setFocused(false); (registerProps as any)?.onBlur?.(e); }}
      style={{
        width: "100%", background: T.surface, border: `1px solid ${focused ? T.goldBorder : T.border}`,
        color: T.text, fontFamily: fonts.mono, fontSize: "0.78rem", padding: "0.55rem 0.75rem",
        outline: "none", transition: "border-color 0.15s",
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
        width: "100%", background: T.surface, border: `1px solid ${focused ? T.goldBorder : T.border}`,
        color: T.text, fontFamily: fonts.mono, fontSize: "0.78rem", padding: "0.55rem 0.75rem",
        outline: "none", transition: "border-color 0.15s", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A8A29E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center",
        paddingRight: "2rem", cursor: "pointer",
      }}
    >
      {children}
    </select>
  );
}

function LuxTextarea({ placeholder, registerProps }: { placeholder?: string; registerProps?: object }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      placeholder={placeholder}
      {...registerProps}
      onFocus={(e) => { setFocused(true); (registerProps as any)?.onFocus?.(e); }}
      onBlur={(e)  => { setFocused(false); (registerProps as any)?.onBlur?.(e); }}
      rows={3}
      style={{
        width: "100%", background: T.surface, border: `1px solid ${focused ? T.goldBorder : T.border}`,
        color: T.text, fontFamily: fonts.mono, fontSize: "0.78rem", padding: "0.55rem 0.75rem",
        outline: "none", transition: "border-color 0.15s", resize: "vertical",
      }}
    />
  );
}

function LuxButton({ children, type = "button", variant = "primary", onClick, disabled, isLoading }: {
  children: React.ReactNode; type?: "button" | "submit" | "reset";
  variant?: "primary" | "outline"; onClick?: () => void; disabled?: boolean; isLoading?: boolean;
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

function SectionCard({ title, subtitle, index, children }: {
  title: string; subtitle?: string; index: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderTop: `2px solid ${T.gold}`, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}`, background: T.surface }}>
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewPaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saleSearch, setSaleSearch] = useState("");
  const [showSaleDropdown, setShowSaleDropdown] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { method: "cash" },
  });

  const { data: sales } = useQuery<Sale[]>({
    queryKey: ["unpaid-sales", saleSearch],
    queryFn: async () => {
      const { data } = await api.get("/sales", { 
        params: { search: saleSearch, status: "unpaid,partial", limit: 10 } 
      });
      return data.data || data;
    },
    enabled: saleSearch.length > 1,
  });

  const mutation = useMutation({
    mutationFn: (data: PaymentForm) => api.post("/payments", data),
    onSuccess: () => {
      toast({ title: "Payment recorded successfully!", variant: "success" });
      router.push("/payments");
    },
    onError: () => {
      toast({ title: "Failed to record payment", variant: "error" });
    },
  });

  const selectSale = (sale: Sale) => {
    setSelectedSale(sale);
    setValue("saleId", sale.id);
    setSaleSearch(sale.invoiceNumber || `#${sale.id}`);
    setShowSaleDropdown(false);
  };

  const outstandingAmount = selectedSale 
    ? (selectedSale.totalAmount || 0) - (selectedSale.paidAmount || 0)
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');
        @keyframes lux-spin { to { transform: rotate(360deg); } }
        @keyframes lux-fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        .lux-dropdown {
          position: absolute; z-index: 50; width: 100%; top: calc(100% + 4px); left: 0;
          background: ${T.surface}; border: 1px solid ${T.border};
          border-top: 1px solid ${T.goldBorder};
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          animation: lux-fade-in 0.15s ease;
          max-height: 220px; overflow-y: auto;
        }
        .lux-dropdown-item {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 0.65rem 1rem; background: transparent; border: none;
          cursor: pointer; transition: background 0.12s;
          font-family: ${fonts.body}; font-size: 0.82rem; color: ${T.text};
          border-bottom: 1px solid ${T.border};
          text-align: left;
        }
        .lux-dropdown-item:last-child { border-bottom: none; }
        .lux-dropdown-item:hover { background: ${T.surface2}; }
        .lux-dropdown-meta {
          font-family: ${fonts.mono}; font-size: 0.6rem;
          letter-spacing: 0.06em; color: ${T.textMuted};
        }

        @media (max-width: 640px) {
          .lux-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: fonts.body, color: T.text, padding: "2rem 2rem 4rem" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* ── Page Header ── */}
          <div style={{ position: "relative", paddingBottom: "1.75rem", borderBottom: `1px solid ${T.border}`, marginBottom: "2rem" }}>
            <span style={{ position: "absolute", bottom: -1, left: 0, width: 96, height: 1, background: T.gold }} />
            <p style={{ fontFamily: fonts.mono, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, marginBottom: "0.5rem" }}>
              Finance
            </p>
            <h1 style={{ fontFamily: fonts.display, fontSize: "2.75rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: T.text }}>
              Record Payment
            </h1>
            <p style={{ marginTop: "0.4rem", fontSize: "0.8rem", color: T.textMuted, fontWeight: 300, fontFamily: fonts.mono, letterSpacing: "0.04em" }}>
              Record customer payment against an invoice
            </p>
          </div>

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* ── 01 Select Invoice ── */}
              <SectionCard title="Select Invoice" subtitle="Choose the unpaid or partially paid invoice" index="01">
                <div style={{ position: "relative" }}>
                  <LuxField label="Search Invoice" error={errors.saleId?.message}>
                    <div style={{ position: "relative" }}>
                      <Search size={13} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: T.textMuted, pointerEvents: "none" }} />
                      <input
                        placeholder="Search by invoice number or customer..."
                        value={saleSearch}
                        onChange={(e) => { setSaleSearch(e.target.value); setShowSaleDropdown(true); }}
                        onFocus={() => setShowSaleDropdown(true)}
                        style={{
                          width: "100%", background: T.surface,
                          border: `1px solid ${T.border}`, color: T.text,
                          fontFamily: fonts.mono, fontSize: "0.78rem",
                          padding: "0.55rem 0.75rem 0.55rem 2.25rem",
                          outline: "none", transition: "border-color 0.15s",
                        }}
                        onFocusCapture={(e) => (e.target.style.borderColor = T.goldBorder)}
                        onBlurCapture={(e) => (e.target.style.borderColor = T.border)}
                      />
                    </div>
                  </LuxField>

                  {showSaleDropdown && sales && sales.length > 0 && (
                    <div className="lux-dropdown">
                      {sales.map((s) => (
                        <button type="button" key={s.id} className="lux-dropdown-item" onClick={() => selectSale(s)}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <User size={12} color={T.textMuted} />
                            <div>
                              <div style={{ fontWeight: 500 }}>{s.invoiceNumber || `#${s.id}`}</div>
                              <div style={{ fontSize: "0.7rem", color: T.textMuted }}>{s.customerName}</div>
                            </div>
                          </div>
                          <span className="lux-dropdown-meta">
                            Due: {formatCurrency((s.totalAmount || 0) - (s.paidAmount || 0))}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedSale && (
                  <div style={{ marginTop: "1rem", padding: "1rem 1.25rem", background: T.surface3, border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.gold}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                      {[
                        { label: "Customer", value: selectedSale.customerName },
                        { label: "Total Amount", value: formatCurrency(selectedSale.totalAmount || 0) },
                        { label: "Outstanding", value: formatCurrency(outstandingAmount), color: T.red },
                      ].map((r) => (
                        <div key={r.label}>
                          <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.25rem" }}>{r.label}</p>
                          <p style={{ fontFamily: fonts.display, fontSize: "1.1rem", fontWeight: 500, color: r.color || T.text }}>{r.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* ── 02 Payment Details ── */}
              <SectionCard title="Payment Details" subtitle="Amount and payment method" index="02">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }} className="lux-grid-2">
                  <LuxField label="Amount" error={errors.amount?.message}>
                    <LuxInput type="number" step="0.01" placeholder="0.00" registerProps={register("amount", { valueAsNumber: true })} />
                  </LuxField>
                  <LuxField label="Payment Method" error={errors.method?.message}>
                    <LuxSelect registerProps={register("method")}>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="mobile_money">Mobile Money</option>
                    </LuxSelect>
                  </LuxField>
                </div>
                <LuxField label="Reference Number (Optional)">
                  <LuxInput placeholder="Transaction reference, cheque number, etc." registerProps={register("reference")} />
                </LuxField>
                <LuxField label="Notes (Optional)">
                  <LuxTextarea placeholder="Additional notes about this payment" registerProps={register("notes")} />
                </LuxField>
              </SectionCard>

              {/* ── Actions ── */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.25rem" }}>
                <LuxButton variant="outline" onClick={() => router.back()}>Cancel</LuxButton>
                <LuxButton type="submit" isLoading={mutation.isPending}>Record Payment</LuxButton>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}
