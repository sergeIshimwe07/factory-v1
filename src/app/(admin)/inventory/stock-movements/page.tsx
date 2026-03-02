"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "@/lib/api";
import type { StockMovement, PaginatedResponse, StockMovementFilter } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/tables";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/utils/formatters";

export default function StockMovementsPage() {
  const [filters, setFilters] = useState<StockMovementFilter>({ page: 1, limit: 15 });
  const [productSearch, setProductSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<StockMovement>>({
    queryKey: ["stock-movements", filters, productSearch],
    queryFn: async () => {
      const { data } = await api.get("/stock-movements", {
        params: { ...filters, search: productSearch },
      });
      return data;
    },
  });

  const applyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      startDate: dateFrom || undefined,
      endDate: dateTo || undefined,
    }));
  };

  const columns: Column<StockMovement & Record<string, unknown>>[] = [
    {
      key: "createdAt",
      label: "Date",
      render: (item) => formatDate(item.createdAt as string),
    },
    { key: "productName", label: "Product" },
    {
      key: "movementType",
      label: "Type",
      render: (item) => {
        const type = item.movementType as string;
        const isIn = type === "production_in" || type === "return" || type === "adjustment";
        return (
          <Badge variant={isIn ? "success" : "warning"} className="capitalize gap-1">
            {isIn ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {type.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (item) => {
        const type = item.movementType as string;
        const isIn = type === "production_in" || type === "return" || type === "adjustment";
        return (
          <span className={isIn ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {isIn ? "+" : "-"}{formatNumber(item.quantity as number)}
          </span>
        );
      },
    },
    {
      key: "referenceType",
      label: "Reference",
      render: (item) => (
        <span className="text-xs text-slate-500">
          {item.referenceType as string}: {item.referenceId as string}
        </span>
      ),
    },
    { key: "notes", label: "Notes" },
    { key: "createdBy", label: "By" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Stock Movements</h1>
        <p className="text-sm text-slate-500">Track all inventory movements for audit</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Movement Log</CardTitle>
            <SearchInput
              className="w-64"
              placeholder="Search by product..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              onClear={() => setProductSearch("")}
            />
          </div>
        </CardHeader>
        <div className="border-b border-slate-100 px-6 pb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">From</label>
              <Input type="date" className="w-40" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">To</label>
              <Input type="date" className="w-40" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Type</label>
              <select
                className="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    movementType: (e.target.value as StockMovementFilter["movementType"]) || undefined,
                    page: 1,
                  }))
                }
              >
                <option value="">All Types</option>
                <option value="sale">Sale</option>
                <option value="production_in">Production In</option>
                <option value="production_out">Production Out</option>
                <option value="adjustment">Adjustment</option>
                <option value="return">Return</option>
              </select>
            </div>
            <Button size="sm" onClick={applyFilters}>
              Apply
            </Button>
          </div>
        </div>
        <CardContent>
          <DataTable
            columns={columns}
            data={(data?.data || []) as (StockMovement & Record<string, unknown>)[]}
            isLoading={isLoading}
            currentPage={filters.page}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total}
            pageSize={filters.limit}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            emptyMessage="No stock movements found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
