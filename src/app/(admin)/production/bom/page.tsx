"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Search, SlidersHorizontal } from "lucide-react";
import api from "@/lib/api";
import type { BillOfMaterials, PaginatedResponse, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/tables";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/hooks";

const bomSchema = z.object({
  finishedProductId: z.string().min(1, "Select finished product"),
  items: z.array(
    z.object({
      rawMaterialId: z.string().min(1),
      rawMaterialName: z.string(),
      quantityRequired: z.number().min(0.01),
      unit: z.string(),
    })
  ).min(1, "Add at least one raw material"),
});

type BOMForm = z.infer<typeof bomSchema>;

export default function BOMPage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = false; // no filters currently implemented
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);

  const { data, isLoading, refetch } = useQuery<PaginatedResponse<BillOfMaterials>>({
    queryKey: ["boms", page],
    queryFn: async () => {
      const { data } = await api.get("/production/bom", { params: { page, limit: 10 } });
      return data;
    },
  });

  const { data: finishedProducts } = useQuery<Product[]>({
    queryKey: ["finished-search", productSearch],
    queryFn: async () => {
      const { data } = await api.get("/products", { params: { search: productSearch, limit: 10 } });
      return data.data || data;
    },
    enabled: productSearch.length > 1,
  });

  const { data: rawMaterials } = useQuery<Product[]>({
    queryKey: ["materials-search", materialSearch],
    queryFn: async () => {
      const { data } = await api.get("/products", { params: { search: materialSearch, limit: 10 } });
      return data.data || data;
    },
    enabled: materialSearch.length > 1,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BOMForm>({
    resolver: zodResolver(bomSchema),
    defaultValues: { items: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const mutation = useMutation({
    mutationFn: (data: BOMForm) => api.post("/production/bom", data),
    onSuccess: () => {
      toast({ title: "BOM created!", variant: "success" });
      setShowCreateForm(false);
      reset();
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to create BOM", variant: "error" });
    },
  });

  const columns: Column<BillOfMaterials & Record<string, unknown>>[] = [
    { key: "finishedProductName", label: "Finished Product" },
    {
      key: "items",
      label: "Materials",
      render: (item) => {
        const items = item.items as BillOfMaterials["items"];
        return <span className="text-sm">{items.length} materials</span>;
      },
    },
  ];

  return (
    <div className="dash-root">
      <div className="page-header">
        <div>
          <h1 className="header-title">Bill of Materials</h1>
          <p className="header-subtitle">Define raw materials for finished products</p>
        </div>
        {canCreate("production") && (
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4" />
            New BOM
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Bill of Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
              {/* Select finished product */}
              <div className="relative">
                <Label>Finished Product</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm"
                    placeholder="Search finished product..."
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                    onFocus={() => setShowProductDropdown(true)}
                  />
                </div>
                {errors.finishedProductId && (
                  <p className="mt-1 text-sm text-red-600">{errors.finishedProductId.message}</p>
                )}
                {showProductDropdown && finishedProducts && finishedProducts.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                    {finishedProducts.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className="flex w-full px-4 py-2 text-sm hover:bg-slate-50"
                        onClick={() => {
                          setValue("finishedProductId", p.id);
                          setProductSearch(p.name);
                          setShowProductDropdown(false);
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add raw materials */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Raw Materials</Label>
                  <div className="relative w-64">
                    <input
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                      placeholder="Search material to add..."
                      value={materialSearch}
                      onChange={(e) => { setMaterialSearch(e.target.value); setShowMaterialDropdown(true); }}
                      onFocus={() => setShowMaterialDropdown(true)}
                    />
                    {showMaterialDropdown && rawMaterials && rawMaterials.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                        {rawMaterials.map((m) => (
                          <button
                            type="button"
                            key={m.id}
                            className="flex w-full px-4 py-2 text-sm hover:bg-slate-50"
                            onClick={() => {
                              append({
                                rawMaterialId: m.id,
                                rawMaterialName: m.name,
                                quantityRequired: 1,
                                unit: m.unit,
                              });
                              setMaterialSearch("");
                              setShowMaterialDropdown(false);
                            }}
                          >
                            {m.name} ({m.unit})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {fields.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">No materials added yet</p>
                ) : (
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-3 rounded-md border p-3">
                        <span className="flex-1 text-sm font-medium">{field.rawMaterialName}</span>
                        <Input
                          type="number"
                          step="0.01"
                          className="w-24"
                          {...register(`items.${index}.quantityRequired`, { valueAsNumber: true })}
                        />
                        <span className="text-sm text-slate-500">{field.unit}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.items && <p className="mt-1 text-sm text-red-600">{errors.items.message}</p>}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowCreateForm(false); reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={mutation.isPending}>
                  Save BOM
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" />
            <span className="panel-title-text">Existing BOMs</span>
            {data?.total !== undefined && <span className="record-count">{data.total} records</span>}
          </div>
          <Button
            variant={showFilters ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={11} />
            Filters
            {hasActiveFilters && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />}
          </Button>
        </div>
        <div className={`filter-panel${showFilters ? " open" : ""}`}>
          {/* no filter controls yet */}
        </div>
        <div className="table-container">
          <DataTable
            columns={columns}
            data={(data?.data || []) as (BillOfMaterials & Record<string, unknown>)[]}
            isLoading={isLoading}
            currentPage={page}
            totalPages={data?.totalPages || 1}
            onPageChange={setPage}
            emptyMessage="No BOMs defined yet."
          />
        </div>
      </div>
    </div>
  );
}
