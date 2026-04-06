"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { LuxField, LuxInput, LuxSelect, LuxButton, SectionCard, luxTokens, luxFonts } from "@/components/ui/lux-components";

const T = luxTokens;
const fonts = luxFonts;

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

const categoryOptions = [
  { value: "raw", label: "Raw Material" },
  { value: "finished", label: "Finished Product" }
];

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
                    <LuxSelect registerProps={register("category")} options={categoryOptions} placeholder="Select category" />
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