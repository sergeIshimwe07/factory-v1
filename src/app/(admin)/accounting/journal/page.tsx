"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { JournalEntry, PaginatedResponse } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/tables";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/utils/formatters";

export default function JournalPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<JournalEntry>>({
    queryKey: ["journal-entries", page, typeFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 15 };
      if (typeFilter) params.type = typeFilter;
      const { data } = await api.get("/accounting/journal", { params });
      return data;
    },
  });

  const columns: Column<JournalEntry & Record<string, unknown>>[] = [
    {
      key: "createdAt",
      label: "Date",
      render: (item) => formatDate(item.createdAt),
    },
    { key: "description", label: "Description" },
    {
      key: "type",
      label: "Type",
      render: (item) => {
        const t = (item.type as string) || "default";
        return (
        <Badge
          variant={
            t === "sale"
              ? "success"
              : t === "payment"
                ? "info"
                : t === "production"
                  ? "warning"
                  : "default"
          }
          className="capitalize"
        >
          {t}
        </Badge>
        );
      },
    },
    {
      key: "debit",
      label: "Debit",
      render: (item) => (item.debit ? formatCurrency(item.debit as number) : "—"),
    },
    {
      key: "credit",
      label: "Credit",
      render: (item) => (item.credit ? formatCurrency(item.credit as number) : "—"),
    },
    {
      key: "accountName",
      label: "Account",
      render: (item) => String((item as unknown as { accountName: string }).accountName || item.accountId || "—"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Journal Entries</h1>
        <p className="text-sm text-slate-500">Double-entry accounting ledger</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base">Entries</CardTitle>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40">
              <option value="">All Types</option>
              <option value="sale">Sale</option>
              <option value="payment">Payment</option>
              <option value="production">Production</option>
              <option value="commission">Commission</option>
              <option value="adjustment">Adjustment</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={(data?.data || []) as (JournalEntry & Record<string, unknown>)[]}
            isLoading={isLoading}
            currentPage={page}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total}
            pageSize={15}
            onPageChange={setPage}
            emptyMessage="No journal entries found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
