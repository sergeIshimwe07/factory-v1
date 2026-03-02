"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Eye, Ban, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import type { Customer, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/tables";
import { SearchInput } from "@/components/ui/search-input";
import { usePermissions } from "@/hooks";
import { formatCurrency } from "@/utils/formatters";

export default function CustomersPage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<Customer>>({
    queryKey: ["customers", page, search],
    queryFn: async () => {
      const { data } = await api.get("/customers", { params: { page, limit: 10, search } });
      return data;
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
          <Badge variant={blocked ? "danger" : "success"} className="gap-1">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage customer accounts and credit</p>
        </div>
        {canCreate("customers") && (
          <Button onClick={() => router.push("/customers/new")}>
            <Plus className="h-4 w-4" />
            New Customer
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base">Customer List</CardTitle>
            <SearchInput
              className="w-64"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
            />
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
