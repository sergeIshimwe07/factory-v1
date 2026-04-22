"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, History, Calendar } from "lucide-react";
import api, { productPriceApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { LuxField, LuxInput, LuxSelect, LuxButton, SectionCard, luxTokens, luxFonts } from "@/components/ui/lux-components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Product, ProductPrice } from "@/types";

const T = luxTokens;
const fonts = luxFonts;

// ─── Schema ───────────────────────────────────────────────────────────────────
const priceSchema = z.object({
  amount: z.number().min(0, "Must be ≥ 0"),
  currency: z.string().default("USD"),
  startDate: z.string().min(1, "Start date is required"),
  notes: z.string().optional(),
});

type PriceForm = z.infer<typeof priceSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showAddPrice, setShowAddPrice] = useState(false);

  // Fetch product
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data } = await api.get(`/products/${productId}`);
      return data.data;
    },
  });

  // Fetch price history
  const { data: priceHistory, isLoading: pricesLoading } = useQuery<ProductPrice[]>({
    queryKey: ["product-prices", productId],
    queryFn: async () => {
      const { data } = await productPriceApi.getPriceHistory(productId);
      return data.data || [];
    },
  });

  // Add price mutation
  const addPriceMutation = useMutation({
    mutationFn: (data: PriceForm) =>
      productPriceApi.createPrice({
        productId: parseInt(productId),
        amount: data.amount,
        currency: data.currency,
        operatorId: parseInt(user!.id),
        startDate: data.startDate,
        notes: data.notes,
      }),
    onSuccess: () => {
      toast({ title: "Price added successfully!", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["product-prices", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowAddPrice(false);
    },
    onError: () => {
      toast({ title: "Failed to add price", variant: "error" });
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PriceForm>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      currency: "USD",
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  if (productLoading) {
    return <div className="dash-root"><div className="panel">Loading...</div></div>;
  }

  if (!product) {
    return <div className="dash-root"><div className="panel">Product not found</div></div>;
  }

  const currentPrice = priceHistory?.find(p => p.status === "ACTIVE");

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
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          {/* ── Page Header ── */}
          <div style={{ position: "relative", paddingBottom: "1.75rem", borderBottom: `1px solid ${T.border}`, marginBottom: "2rem" }}>
            <span style={{ position: "absolute", bottom: -1, left: 0, width: 96, height: 1, background: T.gold }} />
            <p style={{ fontFamily: fonts.mono, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, marginBottom: "0.5rem" }}>
              Inventory
            </p>
            <h1 style={{ fontFamily: fonts.display, fontSize: "2.75rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: T.text }}>
              Edit Product
            </h1>
            <p style={{ marginTop: "0.4rem", fontSize: "0.8rem", color: T.textMuted, fontWeight: 300, fontFamily: fonts.mono, letterSpacing: "0.04em" }}>
              {product.name}
            </p>
          </div>

          {/* ── Current Price ── */}
          <SectionCard title="Current Price" subtitle="Active price information" index="01">
            {currentPrice ? (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 600, color: T.gold }}>
                  {formatCurrency(currentPrice.amount)}
                </div>
                <Badge variant="success">Active</Badge>
                <div style={{ fontSize: "0.8rem", color: T.textMuted }}>
                  Since {formatDate(currentPrice.startDate)}
                </div>
              </div>
            ) : (
              <div style={{ color: T.textMuted }}>No active price set</div>
            )}
          </SectionCard>

          {/* ── Price History ── */}
          <SectionCard title="Price History" subtitle="All price changes for this product" index="02">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
              <Dialog open={showAddPrice} onOpenChange={setShowAddPrice}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Price
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Price</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit((data) => addPriceMutation.mutate(data))}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <LuxField label="Amount" error={errors.amount?.message}>
                        <LuxInput
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          registerProps={register("amount", { valueAsNumber: true })}
                        />
                      </LuxField>
                      <LuxField label="Currency">
                        <LuxSelect registerProps={register("currency")}>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </LuxSelect>
                      </LuxField>
                      <LuxField label="Start Date" error={errors.startDate?.message}>
                        <LuxInput type="date" registerProps={register("startDate")} />
                      </LuxField>
                      <LuxField label="Notes">
                        <LuxInput placeholder="Reason for price change" registerProps={register("notes")} />
                      </LuxField>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <Button type="button" variant="outline" onClick={() => setShowAddPrice(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" isLoading={addPriceMutation.isPending}>
                          Add Price
                        </Button>
                      </div>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {pricesLoading ? (
              <div>Loading price history...</div>
            ) : priceHistory && priceHistory.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {priceHistory
                  .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                  .map((price) => (
                    <div
                      key={price.id}
                      style={{
                        padding: "1rem",
                        border: `1px solid ${T.border}`,
                        borderRadius: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                          {formatCurrency(price.amount)}
                        </div>
                        <Badge variant={
                          price.status === "ACTIVE" ? "success" :
                          price.status === "EXPIRED" ? "secondary" :
                          price.status === "SUPERSEDED" ? "warning" : "default"
                        }>
                          {price.status}
                        </Badge>
                        <div style={{ fontSize: "0.8rem", color: T.textMuted }}>
                          {formatDate(price.startDate)}
                          {price.endDate && ` - ${formatDate(price.endDate)}`}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: T.textMuted }}>
                        {price.operator.name}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", color: T.textMuted }}>
                No price history available
              </div>
            )}
          </SectionCard>

          {/* ── Actions ── */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.25rem" }}>
            <LuxButton variant="outline" onClick={() => router.back()}>Back</LuxButton>
          </div>

        </div>
      </div>
    </>
  );
}