"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import api from "@/lib/api";
import type { ProductionEntry, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/tables";
import { usePermissions } from "@/hooks";
import { formatDate, formatNumber } from "@/utils/formatters";

export default function ProductionPage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<ProductionEntry>>({
    queryKey: ["production", page],
    queryFn: async () => {
      const { data } = await api.get("/production", { params: { page, limit: 10 } });
      return data;
    },
  });

  const columns: Column<ProductionEntry & Record<string, unknown>>[] = [
    {
      key: "createdAt",
      label: "Date",
      render: (item) => formatDate(item.createdAt as string),
    },
    { key: "finishedProductName", label: "Finished Product" },
    {
      key: "quantityProduced",
      label: "Qty Produced",
      render: (item) => formatNumber(item.quantityProduced as number),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const s = item.status as string;
        const v = s === "completed" ? "success" : s === "pending" ? "warning" : "secondary";
        return (
          <Badge variant={v} className="capitalize">
            {s}
          </Badge>
        );
      },
    },
    { key: "createdBy", label: "Created By" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Production</h1>
          <p className="text-sm text-slate-500">Manage production entries</p>
        </div>
        {canCreate("production") && (
          <Button onClick={() => router.push("/production/new")}>
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Production Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={(data?.data || []) as (ProductionEntry & Record<string, unknown>)[]}
            isLoading={isLoading}
            currentPage={page}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total}
            pageSize={10}
            onPageChange={setPage}
            emptyMessage="No production entries found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
