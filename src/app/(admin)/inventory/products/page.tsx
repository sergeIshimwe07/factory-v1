"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import type { Product, PaginatedResponse, InventoryFilter } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/tables";
import { SearchInput } from "@/components/ui/search-input";
import { usePermissions } from "@/hooks";
import { formatCurrency } from "@/utils/formatters";

export default function ProductsListPage() {
  const router = useRouter();
  const { canCreate, canEdit } = usePermissions();
  const [filters, setFilters] = useState<InventoryFilter>({ page: 1, limit: 10 });
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", filters, search],
    queryFn: async () => {
      const { data } = await api.get("/products", { params: { ...filters, search } });
      return data;
    },
  });

  const columns: Column<Product & Record<string, unknown>>[] = [
    { key: "name", label: "Product Name" },
    { key: "category", label: "Category" },
    { key: "unit", label: "Unit" },
    {
      key: "basePrice",
      label: "Price",
      render: (item) => formatCurrency(item.basePrice as number),
    },
    {
      key: "costPrice",
      label: "Cost",
      render: (item) => formatCurrency(item.costPrice as number),
    },
    {
      key: "currentStock",
      label: "Stock",
      render: (item) => {
        const isLow = (item.currentStock as number) <= (item.minimumStock as number);
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? "font-bold text-red-600" : ""}>{item.currentStock as number}</span>
            {isLow && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
        );
      },
    },
    {
      key: "minimumStock",
      label: "Min Stock",
      render: (item) => (
        <Badge variant={(item.currentStock as number) <= (item.minimumStock as number) ? "danger" : "secondary"}>
          {item.minimumStock as number}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (item) =>
        canEdit("inventory") ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/inventory/products/${item.id}/edit`);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage your product catalog</p>
        </div>
        {canCreate("inventory") && (
          <Button onClick={() => router.push("/inventory/products/new")}>
            <Plus className="h-4 w-4" />
            New Product
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base">Product List</CardTitle>
            <SearchInput
              className="w-64"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={(data?.data || []) as (Product & Record<string, unknown>)[]}
            isLoading={isLoading}
            currentPage={filters.page}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total}
            pageSize={filters.limit}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            emptyMessage="No products found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
