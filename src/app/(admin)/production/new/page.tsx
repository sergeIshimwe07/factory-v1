"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertTriangle, Search } from "lucide-react";
import api from "@/lib/api";
import type { BillOfMaterials, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { formatNumber } from "@/utils/formatters";

const productionSchema = z.object({
  finishedProductId: z.string().min(1, "Select a finished product"),
  quantityProduced: z.number().min(1, "Must produce at least 1"),
});

type ProductionForm = z.infer<typeof productionSchema>;

export default function NewProductionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<BillOfMaterials | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductionForm>({
    resolver: zodResolver(productionSchema),
    defaultValues: { quantityProduced: 1 },
  });

  const qty = watch("quantityProduced");

  // Search finished products (ones that have BOMs)
  const { data: products } = useQuery<Product[]>({
    queryKey: ["finished-products", searchText],
    queryFn: async () => {
      const { data } = await api.get("/products", { params: { search: searchText, type: "finished", limit: 10 } });
      return data.data || data;
    },
    enabled: searchText.length > 1,
  });

  // Fetch BOM for selected product
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

  // Check if any raw material is insufficient
  const insufficientMaterials = selectedBOM?.items.filter(
    (item) => item.quantityRequired * (qty || 0) > 0 // actual stock check would happen via API
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Production Entry</h1>
        <p className="text-sm text-slate-500">Record a production of finished goods</p>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Finished Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Label>Search Finished Product</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  placeholder="Search product..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
              </div>
              {errors.finishedProductId && (
                <p className="mt-1 text-sm text-red-600">{errors.finishedProductId.message}</p>
              )}

              {showDropdown && products && products.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                  {products.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-slate-50"
                      onClick={() => selectProduct(p)}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-slate-400">Stock: {p.currentStock}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Label>Quantity to Produce</Label>
              <Input
                type="number"
                min={1}
                {...register("quantityProduced", { valueAsNumber: true })}
                error={errors.quantityProduced?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Required raw materials */}
        {selectedBOM && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Required Raw Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedBOM.items.map((item) => {
                  const required = item.quantityRequired * (qty || 0);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-slate-100 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.rawMaterialName}</p>
                        <p className="text-xs text-slate-400">
                          {item.quantityRequired} {item.unit} per unit
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Required: {formatNumber(required)} {item.unit}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {insufficientMaterials && insufficientMaterials.length > 0 && (
                <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Verify raw material stock before proceeding.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Submit Production
          </Button>
        </div>
      </form>
    </div>
  );
}
