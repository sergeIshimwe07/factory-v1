"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Eye, Printer, Filter } from "lucide-react";
import api from "@/lib/api";
import type { Sale, PaginatedResponse, SalesFilter } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/tables";
import { SearchInput } from "@/components/ui/search-input";
import { usePermissions } from "@/hooks";
import { formatCurrency, formatDate, getStatusColor } from "@/utils/formatters";

export default function SalesListPage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const [filters, setFilters] = useState<SalesFilter>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<Sale>>({
    queryKey: ["sales", filters],
    queryFn: async () => {
      const { data } = await api.get("/sales", { params: filters });
      return data;
    },
  });

  const applyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      startDate: dateFrom || undefined,
      endDate: dateTo || undefined,
      agentId: agentFilter || undefined,
      customerId: customerFilter || undefined,
    }));
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setAgentFilter("");
    setCustomerFilter("");
    setFilters({ page: 1, limit: 10 });
  };

  const statusBadge = (status: string) => {
    const variant = status === "paid" ? "success" : status === "partial" ? "warning" : "danger";
    return (
      <Badge variant={variant} className="capitalize">
        {status}
      </Badge>
    );
  };

  const columns: Column<Sale & Record<string, unknown>>[] = [
    { key: "invoiceNumber", label: "Invoice #" },
    { key: "customerName", label: "Customer" },
    { key: "agentName", label: "Agent" },
    {
      key: "totalAmount",
      label: "Total",
      render: (item) => formatCurrency(item.totalAmount as number),
    },
    {
      key: "paidAmount",
      label: "Paid",
      render: (item) => formatCurrency(item.paidAmount as number),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => statusBadge(item.status as string),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (item) => formatDate(item.createdAt as string),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/sales/${item.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              window.print();
            }}
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales</h1>
          <p className="text-sm text-slate-500">Manage sales orders and invoices</p>
        </div>
        {canCreate("sales") && (
          <Button onClick={() => router.push("/sales/new")}>
            <Plus className="h-4 w-4" />
            New Sale
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Sales List</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <div className="border-b border-slate-100 px-6 pb-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">From Date</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">To Date</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Agent</label>
                <SearchInput
                  placeholder="Search agent..."
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  onClear={() => setAgentFilter("")}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Customer</label>
                <SearchInput
                  placeholder="Search customer..."
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  onClear={() => setCustomerFilter("")}
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button size="sm" variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>
        )}

        <CardContent>
          <DataTable
            columns={columns}
            data={(data?.data || []) as (Sale & Record<string, unknown>)[]}
            isLoading={isLoading}
            currentPage={filters.page}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total}
            pageSize={filters.limit}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            onRowClick={(item) => router.push(`/sales/${item.id}`)}
            emptyMessage="No sales found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
