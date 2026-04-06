"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, SlidersHorizontal } from "lucide-react";
import api from "@/lib/api";
import type { ProductionEntry, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/tables";
import { usePermissions } from "@/hooks";
import { formatDate, formatNumber } from "@/utils/formatters";

export default function ProductionPage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = search !== "";

  const { data, isLoading } = useQuery<PaginatedResponse<ProductionEntry>>({
    queryKey: ["production", page, search],
    queryFn: async () => {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await api.get("/production", { params });
      return data.data;
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
    <div className="dash-root">
      <div className="page-header">
        <div>
          <h1 className="header-title">Production</h1>
          <p className="header-subtitle">Manage production entries</p>
        </div>
        {canCreate("production") && (
          <Button onClick={() => router.push("/production/new")}>
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" />
            <span className="panel-title-text">Production Entries</span>
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
          <div className="filter-section">
            <Input
              placeholder="Search finished product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
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
        </div>
      </div>
    </div>
  );
}
