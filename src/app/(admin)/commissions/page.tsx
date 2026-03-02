"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import type { Commission, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/tables";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/hooks";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useAuthStore } from "@/lib/auth";

export default function CommissionsPage() {
  const { canEdit } = usePermissions();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const isAgent = user?.role === "sales_agent";

  const { data, isLoading } = useQuery<PaginatedResponse<Commission>>({
    queryKey: ["commissions", page, monthFilter, statusFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (monthFilter) params.month = monthFilter;
      if (statusFilter) params.status = statusFilter;
      if (isAgent) params.agentId = user?.id;
      const { data } = await api.get("/commissions", { params });
      return data;
    },
  });

  const markPaid = useMutation({
    mutationFn: (commissionId: string) => api.patch(`/commissions/${commissionId}/mark-paid`),
    onSuccess: () => {
      toast({ title: "Commission marked as paid", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });

  const columns: Column<Commission & Record<string, unknown>>[] = [
    {
      key: "agentName",
      label: "Agent",
      render: (item) => (item as unknown as { agentName: string }).agentName || "—",
    },
    {
      key: "saleInvoice",
      label: "Sale",
      render: (item) => (item as unknown as { saleInvoice: string }).saleInvoice || `#${item.saleId}`,
    },
    {
      key: "amount",
      label: "Amount",
      render: (item) => (
        <span className="font-semibold text-green-700">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (item) => formatDate(item.createdAt),
    },
    {
      key: "isPaid",
      label: "Status",
      render: (item) => (
        <Badge variant={item.isPaid ? "success" : "warning"}>
          {item.isPaid ? "Paid" : "Unpaid"}
        </Badge>
      ),
    },
    ...(!isAgent && canEdit("commissions")
      ? [
          {
            key: "actions" as const,
            label: "",
            render: (item: Commission & Record<string, unknown>) =>
              !item.isPaid ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    markPaid.mutate(item.id);
                  }}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Mark Paid
                </Button>
              ) : null,
          },
        ]
      : []),
  ];

  const paidTotal =
    data?.data?.filter((c) => c.isPaid).reduce((s, c) => s + c.amount, 0) ?? 0;
  const unpaidTotal =
    data?.data?.filter((c) => !c.isPaid).reduce((s, c) => s + c.amount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Commissions</h1>
        <p className="text-sm text-slate-500">
          {isAgent ? "Your commission earnings" : "Manage agent commissions"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-green-50 p-3">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Paid</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(paidTotal)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-yellow-50 p-3">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Unpaid</p>
              <p className="text-xl font-bold text-yellow-600">{formatCurrency(unpaidTotal)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-50 p-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total (Page)</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(paidTotal + unpaidTotal)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base">Commission Records</CardTitle>
            <div className="flex gap-2">
              <input
                type="month"
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={(data?.data || []) as (Commission & Record<string, unknown>)[]}
            isLoading={isLoading}
            currentPage={page}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total}
            pageSize={10}
            onPageChange={setPage}
            emptyMessage="No commission records found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
