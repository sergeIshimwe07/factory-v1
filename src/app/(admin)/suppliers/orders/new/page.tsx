"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, AlertTriangle, Search, Package, Mail, Phone, Clock } from "lucide-react";
import api from "@/lib/api";
import type { Supplier, RawMaterial } from "@/types";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatNumber } from "@/utils/formatters";

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
  greenDim:    "rgba(5,150,105,0.08)",
  greenBorder: "rgba(5,150,105,0.20)",
} as const;

const fonts = {
  display: "'Cormorant Garamond', serif",
  mono:    "'DM Mono', monospace",
  body:    "'Outfit', sans-serif",
};

const orderItemSchema = z.object({
  rawMaterialId: z.string().min(1, "Material required"),
  rawMaterialName: z.string(),
  quantity: z.number().min(1, "Min 1"),
  unit: z.string(),
  unitPrice: z.number().min(0),
  minimumOrder: z.number(),
  leadTime: z.number(),
});

const orderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  supplierName: z.string(),
  deliveryDate: z.string().min(1, "Delivery date required"),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Add at least one material"),
});

type OrderFormData = z.infer<typeof orderSchema>;
type OrderFormInput = z.input<typeof orderSchema>;

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

function EmailPreview({ supplier, items, deliveryDate, total }: { supplier: Supplier | null; items: any[]; deliveryDate: string; total: number }) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      display: "flex",
      flexDirection: "column",
      height: "100%",
      position: "sticky",
      top: "2rem",
    }}>
      {/* Email Header */}
      <div style={{ padding: "1.5rem", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Mail size={16} color={T.textMuted} />
        <span style={{ fontFamily: fonts.mono, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted }}>
          Email Preview
        </span>
        <div />
      </div>

      {/* Email Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "0", fontFamily: fonts.body }}>
        <div style={{ padding: "2rem", fontSize: "0.85rem", lineHeight: 1.6, color: T.text }}>
          
          {/* Email Header */}
          <div style={{ marginBottom: "1.5rem", borderBottom: `1px solid ${T.border}`, paddingBottom: "1rem" }}>
            <p style={{ fontFamily: fonts.display, fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem", color: T.gold }}>
              Purchase Order Request
            </p>
            <p style={{ fontSize: "0.75rem", color: T.textMuted }}>
              Generated on {today}
            </p>
          </div>

          {/* To */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.5rem" }}>
              To:
            </p>
            {supplier ? (
              <>
                <p style={{ fontWeight: 500, marginBottom: "0.25rem" }}>{supplier.name}</p>
                <p style={{ fontSize: "0.8rem", color: T.textDim }}>{supplier.email}</p>
                <p style={{ fontSize: "0.8rem", color: T.textDim }}>{supplier.phone}</p>
              </>
            ) : (
              <p style={{ color: T.textMuted, fontStyle: "italic" }}>Select a supplier</p>
            )}
          </div>

          {/* Details */}
          <div style={{ marginBottom: "1.5rem", background: T.surface2, padding: "1rem", border: `1px solid ${T.border}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.8rem" }}>
              <div>
                <p style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.3rem" }}>Delivery Date</p>
                <p style={{ fontWeight: 500 }}>{deliveryDate || "Not specified"}</p>
              </div>
              <div>
                <p style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.3rem" }}>PO Date</p>
                <p style={{ fontWeight: 500 }}>{today}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                    <th style={{ textAlign: "left", padding: "0.5rem 0", fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, fontWeight: 500 }}>
                      Material
                    </th>
                    <th style={{ textAlign: "right", padding: "0.5rem 0", fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, fontWeight: 500 }}>
                      Qty
                    </th>
                    <th style={{ textAlign: "right", padding: "0.5rem 0", fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, fontWeight: 500 }}>
                      Unit Price
                    </th>
                    <th style={{ textAlign: "right", padding: "0.5rem 0", fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, fontWeight: 500 }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "0.75rem 0" }}>
                        <p style={{ fontWeight: 500, marginBottom: "0.2rem" }}>{item.rawMaterialName}</p>
                        <p style={{ color: T.textMuted, fontSize: "0.7rem" }}>{item.unit}</p>
                      </td>
                      <td style={{ textAlign: "right", padding: "0.75rem 0" }}>{formatNumber(item.quantity)}</td>
                      <td style={{ textAlign: "right", padding: "0.75rem 0" }}>{formatCurrency(item.unitPrice)}</td>
                      <td style={{ textAlign: "right", padding: "0.75rem 0", fontWeight: 500 }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total */}
          <div style={{ marginBottom: "1.5rem", textAlign: "right", borderTop: `1px solid ${T.border}`, paddingTop: "1rem" }}>
            <p style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.5rem" }}>
              Order Total
            </p>
            <p style={{ fontFamily: fonts.display, fontSize: "1.4rem", fontWeight: 600, color: T.gold }}>
              {formatCurrency(total)}
            </p>
          </div>

          {/* Footer */}
          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: `1px solid ${T.border}`, fontSize: "0.75rem", color: T.textMuted, fontStyle: "italic" }}>
            <p>This is an automated purchase order. Please confirm receipt and expected delivery date.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewSupplierOrderPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [supplierSearch, setSupplierSearch] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<OrderFormInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: { items: [], supplierId: "", supplierName: "", deliveryDate: "" },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchItems = watch("items");
  const watchDeliveryDate = watch("deliveryDate");

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["suppliers-search", supplierSearch],
    queryFn: async () => {
      const { data } = await api.get("/suppliers", { params: { search: supplierSearch, limit: 10 } });
      return data.data.data || [];
    },
    enabled: supplierSearch.length > 1,
  });

  const { data: materials } = useQuery<RawMaterial[]>({
    queryKey: ["raw-materials-search", materialSearch, selectedSupplier?.id],
    queryFn: async () => {
      const { data } = await api.get("/products", { params: { search: materialSearch, type: "product", limit: 10 } });
      return data.data.data || [];
    },
    enabled: materialSearch.length > 1 && !!selectedSupplier?.id,
  });

  const mutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const payload = {
        supplierId: data.supplierId,
        deliveryDate: data.deliveryDate,
        notes: data.notes,
        items: data.items.map((item) => ({
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
      return api.post("/supplier-orders", payload);
    },
    onSuccess: () => {
      toast({ title: "Purchase order created!", variant: "success" });
      router.push("/suppliers/orders");
    },
    onError: () => {
      toast({ title: "Failed to create purchase order", variant: "error" });
    },
  });

  const selectSupplier = useCallback((supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setValue("supplierId", supplier.id);
    setValue("supplierName", supplier.name);
    setSupplierSearch(supplier.name);
    setShowSupplierDropdown(false);
  }, [setValue]);

  const addMaterial = useCallback((material: RawMaterial) => {
    if (watchItems.some((item) => item.rawMaterialId === material.id)) {
      toast({ title: "Material already added", variant: "warning" });
      return;
    }
    append({ 
      rawMaterialId: material.id, 
      rawMaterialName: material.name, 
      quantity: material.minimumOrderQty || 1, 
      unit: material.unit,
      unitPrice: material.currentCost || 0,
      minimumOrder: material.minimumOrderQty || 1,
      leadTime: material.leadTimeDays || 0,
    });
    setMaterialSearch("");
    setShowMaterialDropdown(false);
  }, [append, watchItems, toast]);

  const total = useMemo(() => {
    return watchItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [watchItems]);

  const hasMinOrderIssue = watchItems.some((item) => item.quantity < item.minimumOrder);
  const canSave = !hasMinOrderIssue && watchItems.length > 0;

  const onSubmit = (data: OrderFormInput) => {
    if (canSave) mutation.mutate(data as OrderFormData);
  };

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

        .lux-material-row {
          display: grid;
          grid-template-columns: 2fr 80px 100px 100px 60px 40px;
          gap: 0.75rem; align-items: start;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid ${T.border};
          transition: background 0.15s;
          position: relative;
        }
        .lux-material-row:last-child { border-bottom: none; }
        .lux-material-row:hover { background: ${T.surface2}; }
        .lux-material-row.has-error { background: ${T.redDim}; border-left: 2px solid ${T.red}; }

        .lux-col-header {
          display: grid;
          grid-template-columns: 2fr 80px 100px 100px 60px 40px;
          gap: 0.75rem; padding: 0.6rem 1.25rem;
          background: ${T.bg}; border-bottom: 1px solid ${T.border};
        }
        .lux-col-header span {
          font-family: ${fonts.mono}; font-size: 0.58rem;
          letter-spacing: 0.15em; text-transform: uppercase; color: ${T.textMuted};
        }

        .split-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 1200px) {
          .split-layout {
            grid-template-columns: 1fr;
          }
        }

        .lux-warning {
          display: flex; align-items: flex-start; gap: 0.75rem;
          padding: 1rem 1.25rem;
          border: 1px solid ${T.redBorder};
          border-left: 2px solid ${T.red};
          background: ${T.redDim};
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: fonts.body, color: T.text, padding: "2rem 2rem 4rem" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>

          {/* ── Page Header ── */}
          <div style={{ position: "relative", paddingBottom: "1.75rem", borderBottom: `1px solid ${T.border}`, marginBottom: "2rem" }}>
            <span style={{ position: "absolute", bottom: -1, left: 0, width: 96, height: 1, background: T.gold }} />
            <p style={{ fontFamily: fonts.mono, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, marginBottom: "0.5rem" }}>
              Procurement
            </p>
            <h1 style={{ fontFamily: fonts.display, fontSize: "2.75rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: T.text }}>
              New Purchase Order
            </h1>
            <p style={{ marginTop: "0.4rem", fontSize: "0.8rem", color: T.textMuted, fontWeight: 300, fontFamily: fonts.mono, letterSpacing: "0.04em" }}>
              Order raw materials from supplier
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="split-layout">
              
              {/* LEFT SIDE - FORM */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                {/* ── Supplier Section ── */}
                <SectionCard title="Supplier" dot={T.gold}>
                  <div style={{ position: "relative" }}>
                    <FieldLabel>Search Supplier</FieldLabel>
                    <div style={{ position: "relative" }}>
                      <Search size={13} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: T.textMuted, pointerEvents: "none" }} />
                      <input
                        placeholder="Search by name or contact..."
                        value={supplierSearch}
                        onChange={(e) => { setSupplierSearch(e.target.value); setShowSupplierDropdown(true); }}
                        onFocus={() => setShowSupplierDropdown(true)}
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

                    {errors.supplierId && (
                      <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", color: T.red, marginTop: "0.3rem", letterSpacing: "0.05em" }}>
                        {errors.supplierId.message}
                      </p>
                    )}

                    {showSupplierDropdown && suppliers && suppliers.length > 0 && (
                      <div className="lux-dropdown">
                        {suppliers.map((s) => (
                          <button type="button" key={s.id} className="lux-dropdown-item" onClick={() => selectSupplier(s)}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <Package size={12} color={T.textMuted} />
                              <span style={{ fontWeight: 500 }}>{s.name}</span>
                            </div>
                            <span className="lux-dropdown-meta">{s.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedSupplier && (
                    <div style={{ marginTop: "1rem", padding: "1rem 1.25rem", background: T.surface3, border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.gold}` }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                          <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.25rem" }}>Supplier</p>
                          <p style={{ fontFamily: fonts.display, fontSize: "1rem", fontWeight: 500, color: T.text }}>{selectedSupplier.name}</p>
                        </div>
                        <div>
                          <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.25rem" }}>Payment Terms</p>
                          <p style={{ fontFamily: fonts.display, fontSize: "1rem", fontWeight: 500, color: T.text }}>{selectedSupplier.paymentTerms || "Net 30"}</p>
                        </div>
                      </div>
                      <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: `1px solid ${T.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: T.textDim }}>
                          <Mail size={12} />
                          <span>{selectedSupplier.email}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* ── Delivery Details ── */}
                <SectionCard title="Delivery Details" dot="#2D7FC2">
                  <FieldLabel>Expected Delivery Date</FieldLabel>
                  <LuxInput type="date" registerProps={register("deliveryDate")} error={errors.deliveryDate?.message} />
                  
                  <FieldLabel style={{ marginTop: "1rem" }}>Special Notes</FieldLabel>
                  <textarea
                    {...register("notes")}
                    placeholder="E.g., storage requirements, special handling..."
                    style={{
                      width: "100%", minHeight: 80, background: T.surface, border: `1px solid ${T.border}`, 
                      color: T.text, fontFamily: fonts.body, fontSize: "0.75rem", padding: "0.75rem",
                      outline: "none", resize: "vertical", transition: "border-color 0.15s",
                    }}
                  />
                </SectionCard>

                {/* ── Materials Section ── */}
                <SectionCard
                  title="Materials"
                  dot="#2D7FC2"
                  action={
                    selectedSupplier ? (
                      <div style={{ position: "relative", width: 240 }}>
                        <Search size={12} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: T.textMuted, pointerEvents: "none" }} />
                        <input
                          placeholder="Search material..."
                          value={materialSearch}
                          onChange={(e) => { setMaterialSearch(e.target.value); setShowMaterialDropdown(true); }}
                          onFocus={() => setShowMaterialDropdown(true)}
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
                        {showMaterialDropdown && materials && materials.length > 0 && (
                          <div className="lux-dropdown">
                            {materials.map((m) => (
                              <button type="button" key={m.id} className="lux-dropdown-item" onClick={() => addMaterial(m)}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <Package size={12} color={T.textMuted} />
                                  <span style={{ fontWeight: 500 }}>{m.name}</span>
                                </div>
                                <span className="lux-dropdown-meta">
                                  {formatCurrency(m.currentCost || 0)} / {m.unit}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontFamily: fonts.mono, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted }}>
                        Select supplier first
                      </span>
                    )
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
                        Search and add materials above
                      </p>
                    </div>
                  ) : (
                    <div style={{ margin: "-1.5rem", overflow: "hidden" }}>
                      <div className="lux-col-header">
                        {["Material", "Qty", "Unit", "Unit Price", "Total", ""].map((h, i) => (
                          <span key={i}>{h}</span>
                        ))}
                      </div>

                      {fields.map((field, index) => {
                        const item = watchItems[index];
                        const lineTotal = item ? item.quantity * item.unitPrice : 0;
                        const minOrderWarning = item && item.quantity < item.minimumOrder;

                        return (
                          <div key={field.id} className={`lux-material-row${minOrderWarning ? " has-error" : ""}`}>
                            <div>
                              <p style={{ fontSize: "0.83rem", fontWeight: 500, color: T.text, marginBottom: "0.2rem" }}>{field.rawMaterialName}</p>
                              <p style={{ fontFamily: fonts.mono, fontSize: "0.6rem", color: T.textMuted }}>
                                Min: {field.minimumOrder} {field.unit}
                              </p>
                              {minOrderWarning && (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.3rem", color: T.red, fontFamily: fonts.mono, fontSize: "0.58rem" }}>
                                  <AlertTriangle size={10} /> Below min order
                                </div>
                              )}
                            </div>

                            <LuxInput type="number" min={1} registerProps={register(`items.${index}.quantity`, { valueAsNumber: true })} />

                            <LuxInput registerProps={register(`items.${index}.unit`)} readOnly />

                            <LuxInput type="number" step="0.01" registerProps={register(`items.${index}.unitPrice`, { valueAsNumber: true })} />

                            <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                              <span style={{ fontFamily: fonts.display, fontSize: "0.95rem", fontWeight: 500, color: T.text }}>
                                {formatCurrency(lineTotal)}
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                              <LuxButton variant="danger" onClick={() => remove(index)}>
                                <Trash2 size={12} />
                              </LuxButton>
                            </div>
                          </div>
                        );
                      })}

                      {/* Total */}
                      <div style={{ padding: "1.25rem 1.5rem", borderTop: `1px solid ${T.border}`, background: T.surface3 }}>
                        <div style={{ maxWidth: 300, marginLeft: "auto" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.5rem", marginBottom: "0.5rem", borderBottom: `1px solid ${T.goldBorder}` }}>
                            <span style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: T.gold }}>Total</span>
                            <span style={{ fontFamily: fonts.display, fontSize: "1.4rem", fontWeight: 600, color: T.text }}>{formatCurrency(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* ── Warnings ── */}
                {hasMinOrderIssue && (
                  <div className="lux-warning">
                    <AlertTriangle size={16} style={{ color: T.red, flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.red, marginBottom: "0.25rem" }}>
                        Minimum Order Quantities
                      </p>
                      <p style={{ fontSize: "0.82rem", color: T.textDim }}>
                        Some materials have quantities below their minimum order. Adjust quantities to proceed.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Actions ── */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.5rem" }}>
                  <LuxButton variant="outline" onClick={() => router.back()}>Cancel</LuxButton>
                  <LuxButton type="submit" disabled={!canSave} isLoading={mutation.isPending}>
                    Create Purchase Order
                  </LuxButton>
                </div>

              </div>

              {/* RIGHT SIDE - EMAIL PREVIEW */}
              <EmailPreview 
                supplier={selectedSupplier} 
                items={watchItems} 
                deliveryDate={watchDeliveryDate}
                total={total}
              />

            </div>
          </form>
        </div>
      </div>
    </>
  );
}
