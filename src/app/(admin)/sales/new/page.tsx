"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, AlertTriangle, Search, User, Package } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import type { Product, Customer } from "@/types";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/utils/formatters";

// ─── Light mode tokens ────────────────────────────────────────────────────────
const T = {
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
  redBorder:   "rgba(220,38,38,0.20)",
  amber:       "#B45309",
  amberDim:    "rgba(180,83,9,0.08)",
  amberBorder: "rgba(180,83,9,0.20)",
  green:       "#059669",
} as const;

const fonts = {
  display: "'Cormorant Garamond', serif",
  mono:    "'DM Mono', monospace",
  body:    "'Outfit', sans-serif",
};

// ─── Schemas ──────────────────────────────────────────────────────────────────
const saleItemSchema = z.object({
  productId:      z.string().min(1, "Product required"),
  productName:    z.string(),
  quantity:       z.number().min(1, "Min 1"),
  unit:           z.string(),
  unitPrice:      z.number().min(0),
  discount:       z.number().min(0).default(0),
  availableStock: z.number(),
  minimumPrice:   z.number(),
});

const saleSchema = z.object({
  customerId:   z.string().min(1, "Customer is required"),
  customerName: z.string(),
  items:        z.array(saleItemSchema).min(1, "Add at least one product"),
});

type SaleFormData  = z.infer<typeof saleSchema>;
type SaleFormInput = z.input<typeof saleSchema>;

// ─── Primitives ───────────────────────────────────────────────────────────────

function LuxInput({
  type = "text", value, onChange, onFocus, placeholder, readOnly, step, min,
  registerProps, error,
}: {
  type?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void; placeholder?: string; readOnly?: boolean; step?: string; min?: number;
  registerProps?: object; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ width: "100%" }}>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        readOnly={readOnly} step={step} min={min}
        {...registerProps}
        onFocus={(e) => { setFocused(true); onFocus?.(); (registerProps as any)?.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); (registerProps as any)?.onBlur?.(e); }}
        style={{
          width:       "100%",
          background:  readOnly ? T.surface3 : T.surface,
          border:      `1px solid ${focused ? T.goldBorder : T.border}`,
          color:       T.text,
          fontFamily:  fonts.mono,
          fontSize:    "0.75rem",
          padding:     "0.5rem 0.75rem",
          outline:     "none",
          transition:  "border-color 0.15s",
        }}
      />
      {error && (
        <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", color: T.red, marginTop: "0.3rem", letterSpacing: "0.05em" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function LuxButton({
  children, onClick, type = "button", variant = "primary", disabled, isLoading,
}: {
  children: React.ReactNode; onClick?: () => void; type?: "button" | "submit" | "reset";
  variant?: "primary" | "outline" | "ghost" | "danger"; disabled?: boolean; isLoading?: boolean;
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
    ghost: {
      background:  hovered ? T.surface2 : "transparent",
      borderColor: "transparent",
      color:       hovered ? T.red : T.textMuted,
    },
    danger: {
      background:  hovered ? T.redDim : "transparent",
      borderColor: hovered ? T.redBorder : T.border,
      color:       hovered ? T.red : T.textMuted,
    },
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || isLoading}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
        padding: "0.55rem 1.25rem", border: "1px solid transparent",
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

function SectionCard({ children, title, dot = T.gold, action }: { children: React.ReactNode; title: string; dot?: string; action?: React.ReactNode }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderTop: `2px solid ${T.gold}`, overflow: "visible" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontFamily: fonts.display, fontSize: "1.15rem", fontWeight: 500, color: T.text }}>
            {title}
          </span>
        </div>
        {action}
      </div>
      <div style={{ padding: "1.5rem" }}>
        {children}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontFamily: fonts.mono, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.4rem" }}>
      {children}
    </label>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CreateSalePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<SaleFormInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: { items: [], customerId: "", customerName: "" },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchItems = watch("items");

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["customers-search", customerSearch],
    queryFn: async () => {
      const { data } = await api.get("/customers", { params: { search: customerSearch, limit: 10 } });
      return data.data || data;
    },
    enabled: customerSearch.length > 1,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["products-search", productSearch],
    queryFn: async () => {
      const { data } = await api.get("/products", { params: { search: productSearch, limit: 10 } });
      return data.data || data;
    },
    enabled: productSearch.length > 1,
  });

  const mutation = useMutation({
    mutationFn: async (data: SaleFormData) => {
      const payload = {
        customerId: data.customerId,
        agentId: user?.id,
        items: data.items.map((item) => ({
          productId: item.productId, quantity: item.quantity,
          unit: item.unit, unitPrice: item.unitPrice, discount: item.discount,
        })),
      };
      return api.post("/sales", payload);
    },
    onSuccess: () => { toast({ title: "Sale created successfully!", variant: "success" }); router.push("/sales"); },
    onError:   () => { toast({ title: "Failed to create sale", variant: "error" }); },
  });

  const selectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setValue("customerId", customer.id);
    setValue("customerName", customer.name);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  }, [setValue]);

  const addProduct = useCallback((product: Product) => {
    if (watchItems.some((item) => item.productId === product.id)) {
      toast({ title: "Product already added", variant: "warning" }); return;
    }
    append({ productId: product.id, productName: product.name, quantity: 1, unit: product.unit, unitPrice: product.basePrice, discount: 0, availableStock: product.currentStock, minimumPrice: product.minimumPrice });
    setProductSearch(""); setShowProductDropdown(false);
  }, [append, watchItems, toast]);

  const subtotal      = watchItems.reduce((s, i) => s + i.quantity * i.unitPrice - (i.discount ?? 0), 0);
  const totalDiscount = watchItems.reduce((s, i) => s + (i.discount ?? 0), 0);
  const hasStockIssue = watchItems.some((i) => i.quantity > i.availableStock);
  const hasCreditIssue = selectedCustomer && subtotal > selectedCustomer.creditLimit - selectedCustomer.creditBalance;
  const canSave = !hasStockIssue && !hasCreditIssue && watchItems.length > 0;

  const onSubmit = (data: SaleFormInput) => { if (canSave) mutation.mutate(data as SaleFormData); };

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

        .lux-product-row {
          display: grid;
          grid-template-columns: 2fr 90px 70px 110px 110px 90px 40px;
          gap: 0.75rem; align-items: start;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid ${T.border};
          transition: background 0.15s;
          position: relative;
        }
        .lux-product-row:last-child { border-bottom: none; }
        .lux-product-row:hover { background: ${T.surface2}; }
        .lux-product-row.has-error { background: ${T.redDim}; border-left: 2px solid ${T.red}; }

        .lux-col-header {
          display: grid;
          grid-template-columns: 2fr 90px 70px 110px 110px 90px 40px;
          gap: 0.75rem; padding: 0.6rem 1.25rem;
          background: ${T.bg}; border-bottom: 1px solid ${T.border};
        }
        .lux-col-header span {
          font-family: ${fonts.mono}; font-size: 0.58rem;
          letter-spacing: 0.15em; text-transform: uppercase; color: ${T.textMuted};
        }

        .lux-summary-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.5rem 0;
          font-family: ${fonts.body}; font-size: 0.82rem;
          border-bottom: 1px solid ${T.border};
        }
        .lux-summary-row:last-child { border-bottom: none; }

        .lux-warning {
          display: flex; align-items: flex-start; gap: 0.75rem;
          padding: 1rem 1.25rem;
          border: 1px solid ${T.redBorder};
          border-left: 2px solid ${T.red};
          background: ${T.redDim};
        }

        @media (max-width: 768px) {
          .lux-product-row, .lux-col-header {
            grid-template-columns: 1fr 1fr;
          }
          .lux-col-header { display: none; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: fonts.body, color: T.text, padding: "2rem 2rem 4rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* ── Page Header ── */}
          <div style={{ position: "relative", paddingBottom: "1.75rem", borderBottom: `1px solid ${T.border}`, marginBottom: "2rem" }}>
            <span style={{ position: "absolute", bottom: -1, left: 0, width: 96, height: 1, background: T.gold }} />
            <p style={{ fontFamily: fonts.mono, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, marginBottom: "0.5rem" }}>
              Revenue
            </p>
            <h1 style={{ fontFamily: fonts.display, fontSize: "2.75rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: T.text }}>
              Create New Sale
            </h1>
            <p style={{ marginTop: "0.4rem", fontSize: "0.8rem", color: T.textMuted, fontWeight: 300, fontFamily: fonts.mono, letterSpacing: "0.04em" }}>
              Agent:&nbsp;<span style={{ color: T.textDim }}>{user?.name || "Unknown"}</span>&nbsp;·&nbsp;Auto-assigned
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* ── Customer Section ── */}
              <SectionCard title="Customer" dot={T.gold}>
                <div style={{ position: "relative" }}>
                  <FieldLabel>Search Customer</FieldLabel>
                  <div style={{ position: "relative" }}>
                    <Search size={13} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: T.textMuted, pointerEvents: "none" }} />
                    <input
                      placeholder="Search by name or phone..."
                      value={customerSearch}
                      onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                      onFocus={() => setShowCustomerDropdown(true)}
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

                  {errors.customerId && (
                    <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", color: T.red, marginTop: "0.3rem", letterSpacing: "0.05em" }}>
                      {errors.customerId.message}
                    </p>
                  )}

                  {showCustomerDropdown && customers && customers.length > 0 && (
                    <div className="lux-dropdown">
                      {customers.map((c) => (
                        <button type="button" key={c.id} className="lux-dropdown-item" onClick={() => selectCustomer(c)}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <User size={12} color={T.textMuted} />
                            <span style={{ fontWeight: 500 }}>{c.name}</span>
                          </div>
                          <span className="lux-dropdown-meta">
                            Credit: {formatCurrency(c.creditLimit - c.creditBalance)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected customer info card */}
                {selectedCustomer && (
                  <div style={{ marginTop: "1rem", padding: "1rem 1.25rem", background: T.surface3, border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.gold}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                      {[
                        { label: "Customer",         value: selectedCustomer.name },
                        { label: "Credit Limit",     value: formatCurrency(selectedCustomer.creditLimit) },
                        { label: "Available Credit", value: formatCurrency(selectedCustomer.creditLimit - selectedCustomer.creditBalance) },
                      ].map((r) => (
                        <div key={r.label}>
                          <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.25rem" }}>{r.label}</p>
                          <p style={{ fontFamily: fonts.display, fontSize: "1.1rem", fontWeight: 500, color: T.text }}>{r.value}</p>
                        </div>
                      ))}
                    </div>
                    {selectedCustomer.isBlocked && (
                      <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", color: T.red, fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em" }}>
                        <AlertTriangle size={13} />
                        CUSTOMER IS BLOCKED
                      </div>
                    )}
                  </div>
                )}
              </SectionCard>

              {/* ── Products Section ── */}
              <SectionCard
                title="Products"
                dot="#2D7FC2"
                action={
                  <div style={{ position: "relative", width: 260 }}>
                    <Search size={12} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: T.textMuted, pointerEvents: "none" }} />
                    <input
                      placeholder="Search product..."
                      value={productSearch}
                      onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                      onFocus={() => setShowProductDropdown(true)}
                      style={{
                        width: "100%", background: T.surface3,
                        border: `1px solid ${T.border}`, color: T.text,
                        fontFamily: fonts.mono, fontSize: "0.72rem",
                        padding: "0.45rem 0.75rem 0.45rem 2.1rem",
                        outline: "none", transition: "border-color 0.15s",
                      }}
                      onFocusCapture={(e) => (e.target.style.borderColor = T.goldBorder)}
                      onBlurCapture={(e) => (e.target.style.borderColor = T.border)}
                    />
                    {showProductDropdown && products && products.length > 0 && (
                      <div className="lux-dropdown">
                        {products.map((p) => (
                          <button type="button" key={p.id} className="lux-dropdown-item" onClick={() => addProduct(p)}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <Package size={12} color={T.textMuted} />
                              <span style={{ fontWeight: 500 }}>{p.name}</span>
                            </div>
                            <span className="lux-dropdown-meta">
                              Stock: {p.currentStock}&nbsp;·&nbsp;{formatCurrency(p.basePrice)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                }
              >
                {errors.items && (
                  <p style={{ fontFamily: fonts.mono, fontSize: "0.6rem", color: T.red, marginBottom: "0.75rem", letterSpacing: "0.08em" }}>
                    {(errors.items as any).message}
                  </p>
                )}

                {fields.length === 0 ? (
                  <div style={{ padding: "3rem 0", textAlign: "center" }}>
                    <div style={{ width: 42, height: 42, border: `1px solid ${T.border}`, background: T.surface3, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                      <Plus size={16} color={T.textMuted} />
                    </div>
                    <p style={{ fontFamily: fonts.mono, fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: T.textMuted }}>
                      Search and add products above
                    </p>
                  </div>
                ) : (
                  <div style={{ margin: "-1.5rem", overflow: "hidden" }}>
                    {/* Column headers */}
                    <div className="lux-col-header">
                      {["Product", "Qty", "Unit", "Unit Price", "Discount", "Total", ""].map((h, i) => (
                        <span key={i}>{h}</span>
                      ))}
                    </div>

                    {/* Rows */}
                    {fields.map((field, index) => {
                      const item         = watchItems[index];
                      const lineTotal    = item ? item.quantity * item.unitPrice - (item.discount ?? 0) : 0;
                      const stockWarning = item && item.quantity > item.availableStock;
                      const priceWarning = item && item.unitPrice < item.minimumPrice;

                      return (
                        <div key={field.id} className={`lux-product-row${stockWarning ? " has-error" : ""}`}>
                          {/* Product name */}
                          <div>
                            <p style={{ fontSize: "0.83rem", fontWeight: 500, color: T.text, marginBottom: "0.2rem" }}>{field.productName}</p>
                            <p style={{ fontFamily: fonts.mono, fontSize: "0.6rem", color: T.textMuted }}>
                              Stock: {field.availableStock}
                            </p>
                            {stockWarning && (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.3rem", color: T.red, fontFamily: fonts.mono, fontSize: "0.58rem" }}>
                                <AlertTriangle size={10} /> Exceeds stock
                              </div>
                            )}
                          </div>

                          {/* Qty */}
                          <LuxInput type="number" min={1} registerProps={register(`items.${index}.quantity`, { valueAsNumber: true })} />

                          {/* Unit */}
                          <LuxInput registerProps={register(`items.${index}.unit`)} readOnly />

                          {/* Unit Price */}
                          <div>
                            <LuxInput type="number" step="0.01" registerProps={register(`items.${index}.unitPrice`, { valueAsNumber: true })} />
                            {priceWarning && (
                              <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", color: T.amber, marginTop: "0.3rem" }}>Below min price</p>
                            )}
                          </div>

                          {/* Discount */}
                          <LuxInput type="number" step="0.01" registerProps={register(`items.${index}.discount`, { valueAsNumber: true })} />

                          {/* Line total */}
                          <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                            <span style={{ fontFamily: fonts.display, fontSize: "1rem", fontWeight: 500, color: T.text }}>
                              {formatCurrency(lineTotal)}
                            </span>
                          </div>

                          {/* Remove */}
                          <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                            <LuxButton variant="danger" onClick={() => remove(index)}>
                              <Trash2 size={12} />
                            </LuxButton>
                          </div>
                        </div>
                      );
                    })}

                    {/* Summary */}
                    <div style={{ padding: "1.25rem 1.5rem", borderTop: `1px solid ${T.border}`, background: T.surface3 }}>
                      <div style={{ maxWidth: 280, marginLeft: "auto" }}>
                        <div className="lux-summary-row">
                          <span style={{ color: T.textDim, fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Subtotal</span>
                          <span style={{ fontFamily: fonts.display, fontSize: "1rem", fontWeight: 500 }}>{formatCurrency(subtotal + totalDiscount)}</span>
                        </div>
                        <div className="lux-summary-row">
                          <span style={{ color: T.textDim, fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Discount</span>
                          <span style={{ fontFamily: fonts.display, fontSize: "1rem", color: T.red }}>−{formatCurrency(totalDiscount)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", marginTop: "0.25rem", borderTop: `1px solid ${T.goldBorder}` }}>
                          <span style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: T.gold }}>Total</span>
                          <span style={{ fontFamily: fonts.display, fontSize: "1.6rem", fontWeight: 600, color: T.text }}>{formatCurrency(subtotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* ── Credit Warning ── */}
              {hasCreditIssue && (
                <div className="lux-warning">
                  <AlertTriangle size={16} style={{ color: T.red, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.red, marginBottom: "0.25rem" }}>
                      Credit Limit Exceeded
                    </p>
                    <p style={{ fontSize: "0.82rem", color: T.textDim }}>
                      This sale ({formatCurrency(subtotal)}) exceeds the customers available credit ({formatCurrency((selectedCustomer?.creditLimit || 0) - (selectedCustomer?.creditBalance || 0))}).
                    </p>
                  </div>
                </div>
              )}

              {/* ── Actions ── */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <LuxButton variant="outline" onClick={() => router.back()}>Cancel</LuxButton>
                <LuxButton type="submit" disabled={!canSave} isLoading={mutation.isPending}>
                  Create Sale
                </LuxButton>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}