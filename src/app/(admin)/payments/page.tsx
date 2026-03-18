"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Eye, SlidersHorizontal } from "lucide-react";
import api from "@/lib/api";
import type { Payment, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/tables";
import { SearchInput } from "@/components/ui/search-input";
import { usePermissions } from "@/hooks";
import { formatCurrency, formatDate } from "@/utils/formatters";

export default function PaymentsPage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = search !== "";

  const { data, isLoading } = useQuery<PaginatedResponse<Payment>>({
    queryKey: ["payments", page, search],
    queryFn: async () => {
      const { data } = await api.get("/payments", { params: { page, limit: 10, search } });
      return data;
    },
  });

  const columns: Column<Payment & Record<string, unknown>>[] = [
    {
      key: "createdAt",
      label: "Date",
      render: (item) => formatDate(item.createdAt),
    },
    { key: "customerName", label: "Customer" },
    { key: "saleInvoice", label: "Invoice" },
    {
      key: "amount",
      label: "Amount",
      render: (item) => (
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 500, color: "var(--text)" }}>
          {formatCurrency(item.amount as number)}
        </span>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (item) => {
        const method = item.method as string;
        return (
          <Badge variant="info" className="capitalize">
            {method.replace("_", " ")}
          </Badge>
        );
      },
    },
    { key: "reference", label: "Reference" },
    {
      key: "actions",
      label: "",
      render: (item) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/payments/${item.id}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="dash-root">
      <div className="page-header">
        <div>
          <p className="header-eyebrow">Finance</p>
          <h1 className="header-title">Payments</h1>
          <p className="header-subtitle">Track customer payments and receipts</p>
        </div>
        {canCreate("payments") && (
          <Button onClick={() => router.push("/payments/new")}>
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" />
            <span className="panel-title-text">Payment Records</span>
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
            <SearchInput
              className="w-64"
              placeholder="Search payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
            />
          </div>
        </div>
        <div className="table-container">
          <DataTable
            columns={columns}
            data={(data?.data || []) as (Payment & Record<string, unknown>)[]}
            isLoading={isLoading}
            currentPage={page}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total}
            pageSize={10}
            onPageChange={setPage}
            onRowClick={(item) => router.push(`/payments/${item.id}`)}
            emptyMessage="No payments found."
          />
        </div>
      </div>
    </div>
  );
}
