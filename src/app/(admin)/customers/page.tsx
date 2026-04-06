"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Eye, Ban, CheckCircle, SlidersHorizontal } from "lucide-react";
import api from "@/lib/api";
import type { Customer, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/tables";
import { SearchInput } from "@/components/ui/search-input";
import { usePermissions } from "@/hooks";
import { formatCurrency } from "@/utils/formatters";

export default function CustomersPage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = search !== "";

  const { data, isLoading } = useQuery<PaginatedResponse<Customer>>({
    queryKey: ["customers", page, search],
    queryFn: async () => {
      const { data } = await api.get("/customers", { params: { page, limit: 10, search } });
      return data.data;
    },
  });

  const columns: Column<Customer & Record<string, unknown>>[] = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    {
      key: "creditLimit",
      label: "Credit Limit",
      render: (item) => formatCurrency(item.creditLimit as number),
    },
    {
      key: "creditBalance",
      label: "Credit Used",
      render: (item) => formatCurrency(item.creditBalance as number),
    },
    {
      key: "isBlocked",
      label: "Status",
      render: (item) => {
        const blocked = item.isBlocked as boolean;
        return (
          <Badge variant={blocked ? "danger" : "success"} className="gap-1 px-2 py-1">
            {blocked ? <Ban className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
            {blocked ? "Blocked" : "Active"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: (item) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/customers/${item.id}`);
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
          <h1 className="header-title">Customers</h1>
          <p className="header-subtitle">Manage customer accounts and credit</p>
        </div>
        {canCreate("customers") && (
          <Button onClick={() => router.push("/customers/new")}>
            <Plus className="h-4 w-4" />
            New Customer
          </Button>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" />
            <span className="panel-title-text">Customer List</span>
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
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
            />
          </div>
        </div>
        <div className="table-container">
          <DataTable
            columns={columns}
            data={(data?.data || []) as (Customer & Record<string, unknown>)[]}
            isLoading={isLoading}
            currentPage={page}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total}
            pageSize={10}
            onPageChange={setPage}
            onRowClick={(item) => router.push(`/customers/${item.id}`)}
            emptyMessage="No customers found."
          />
        </div>
      </div>
    </div>
  );
}
