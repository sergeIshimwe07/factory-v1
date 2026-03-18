"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertTriangle, Search, Package } from "lucide-react";
import api from "@/lib/api";
import type { BillOfMaterials, Product } from "@/types";
import { useToast } from "@/components/ui/toast";
import { formatNumber } from "@/utils/formatters";

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
  amber:       "#B45309",
  amberDim:    "rgba(180,83,9,0.08)",
  amberBorder: "rgba(180,83,9,0.20)",
} as const;

const fonts = {
  display: "'Cormorant Garamond', serif",
  mono:    "'DM Mono', monospace",
  body:    "'Outfit', sans-serif",
};

const productionSchema = z.object({
  finishedProductId: z.string().min(1, "Select a finished product"),
  quantityProduced: z.number().min(1, "Must produce at least 1"),
});

type ProductionForm = z.infer<typeof productionSchema>;

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

function LuxInput({ placeholder, type = "text", step, min, registerProps }: {
  placeholder?: string; type?: string; step?: string; min?: number; registerProps?: object;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} placeholder={placeholder} step={step} min={min}
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

function SectionCard({ title, dot = T.gold, children }: { title: string; dot?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderTop: `2px solid ${T.gold}`, overflow: "visible" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontFamily: fonts.display, fontSize: "1.15rem", fontWeight: 500, color: T.text }}>
            {title}
          </span>
        </div>
      </div>
      <div style={{ padding: "1.5rem" }}>
        {children}
      </div>
    </div>
  );
}

export default function NewProductionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<BillOfMaterials | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductionForm>({
    resolver: zodResolver(productionSchema),
    defaultValues: { quantityProduced: 1 },
  });

  const qty = watch("quantityProduced");

  const { data: products } = useQuery<Product[]>({
    queryKey: ["finished-products", searchText],
    queryFn: async () => {
      const { data } = await api.get("/products", { params: { search: searchText, type: "finished", limit: 10 } });
      return data.data || data;
    },
    enabled: searchText.length > 1,
  });

  const { data: bom } = useQuery<BillOfMaterials>({
    queryKey: ["bom", selectedProduct?.id],
    queryFn: async () => {
      const { data } = await api.get(`/production/bom/${selectedProduct?.id}`);
      return data;
    },
    enabled: !!selectedProduct?.id,
  });

  useEffect(() => {
    if (bom) setSelectedBOM(bom);
  }, [bom]);

  const mutation = useMutation({
    mutationFn: (data: ProductionForm) => api.post("/production", data),
    onSuccess: () => {
      toast({ title: "Production entry created!", variant: "success" });
      router.push("/production");
    },
    onError: () => {
      toast({ title: "Failed to create production entry", variant: "error" });
    },
  });

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setValue("finishedProductId", product.id);
    setSearchText(product.name);
    setShowDropdown(false);
  };

  const insufficientMaterials = selectedBOM?.items.filter(
    (item) => item.quantityRequired * (qty || 0) > 0
  );

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
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: fonts.body, color: T.text, padding: "2rem 2rem 4rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* ── Page Header ── */}
          <div style={{ position: "relative", paddingBottom: "1.75rem", borderBottom: `1px solid ${T.border}`, marginBottom: "2rem" }}>
            <span style={{ position: "absolute", bottom: -1, left: 0, width: 96, height: 1, background: T.gold }} />
            <p style={{ fontFamily: fonts.mono, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, marginBottom: "0.5rem" }}>
              Manufacturing
            </p>
            <h1 style={{ fontFamily: fonts.display, fontSize: "2.75rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: T.text }}>
              New Production Entry
            </h1>
            <p style={{ marginTop: "0.4rem", fontSize: "0.8rem", color: T.textMuted, fontWeight: 300, fontFamily: fonts.mono, letterSpacing: "0.04em" }}>
              Record a production of finished goods
            </p>
          </div>

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* ── Finished Product ── */}
              <SectionCard title="Finished Product" dot={T.gold}>
                <div style={{ position: "relative" }}>
                  <LuxField label="Search Finished Product" error={errors.finishedProductId?.message}>
                    <div style={{ position: "relative" }}>
                      <Search size={13} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: T.textMuted, pointerEvents: "none" }} />
                      <input
                        placeholder="Search product..."
                        value={searchText}
                        onChange={(e) => { setSearchText(e.target.value); setShowDropdown(true); }}
                        onFocus={() => setShowDropdown(true)}
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

                  {showDropdown && products && products.length > 0 && (
                    <div className="lux-dropdown">
                      {products.map((p) => (
                        <button type="button" key={p.id} className="lux-dropdown-item" onClick={() => selectProduct(p)}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Package size={12} color={T.textMuted} />
                            <span style={{ fontWeight: 500 }}>{p.name}</span>
                          </div>
                          <span className="lux-dropdown-meta">Stock: {p.currentStock}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedProduct && (
                  <div style={{ marginTop: "1rem", padding: "1rem 1.25rem", background: T.surface3, border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.gold}` }}>
                    <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.25rem" }}>
                      Selected Product
                    </p>
                    <p style={{ fontFamily: fonts.display, fontSize: "1.1rem", fontWeight: 500, color: T.text }}>{selectedProduct.name}</p>
                  </div>
                )}

                <LuxField label="Quantity to Produce" error={errors.quantityProduced?.message}>
                  <div style={{ maxWidth: 200 }}>
                    <LuxInput type="number" min={1} registerProps={register("quantityProduced", { valueAsNumber: true })} />
                  </div>
                </LuxField>
              </SectionCard>

              {/* ── Required Raw Materials ── */}
              {selectedBOM && (
                <SectionCard title="Required Raw Materials" dot="#2D7FC2">
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {selectedBOM.items.map((item) => {
                      const required = item.quantityRequired * (qty || 0);
                      return (
                        <div
                          key={item.id}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "0.85rem 1rem", background: T.surface2, border: `1px solid ${T.border}`,
                          }}
                        >
                          <div>
                            <p style={{ fontSize: "0.85rem", fontWeight: 500, color: T.text }}>{item.rawMaterialName}</p>
                            <p style={{ fontFamily: fonts.mono, fontSize: "0.6rem", color: T.textMuted }}>
                              {item.quantityRequired} {item.unit} per unit
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "0.85rem", fontWeight: 500, color: T.text }}>
                              {formatNumber(required)} {item.unit}
                            </p>
                            <p style={{ fontFamily: fonts.mono, fontSize: "0.58rem", color: T.textMuted }}>Required</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {insufficientMaterials && insufficientMaterials.length > 0 && (
                    <div style={{
                      marginTop: "1rem", display: "flex", alignItems: "flex-start", gap: "0.75rem",
                      padding: "1rem 1.25rem", border: `1px solid ${T.amberBorder}`,
                      borderLeft: `2px solid ${T.amber}`, background: T.amberDim,
                    }}>
                      <AlertTriangle size={16} style={{ color: T.amber, flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.06em", color: T.amber }}>
                        Verify raw material stock before proceeding.
                      </p>
                    </div>
                  )}
                </SectionCard>
              )}

              {/* ── Actions ── */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <LuxButton variant="outline" onClick={() => router.back()}>Cancel</LuxButton>
                <LuxButton type="submit" isLoading={mutation.isPending}>Submit Production</LuxButton>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}
