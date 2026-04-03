"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Ban, CheckCircle, Edit } from "lucide-react";
import api from "@/lib/api";
import type { Customer, Sale, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageLoader } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/hooks";
import { formatCurrency, formatDate } from "@/utils/formatters";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { canEdit } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customer, isLoading, error, refetch } = useQuery<Customer>({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data } = await api.get(`/customers/${id}`);
      return data;
    },
  });

  const { data: salesHistory } = useQuery<PaginatedResponse<Sale>>({
    queryKey: ["customer-sales", id],
    queryFn: async () => {
      const { data } = await api.get("/sales", { params: { customerId: id, limit: 20 } });
      return data;
    },
    enabled: !!customer,
  });

  const toggleBlock = useMutation({
    mutationFn: () => api.patch(`/customers/${id}/toggle-block`),
    onSuccess: () => {
      toast({ title: customer?.isBlocked ? "Customer unblocked" : "Customer blocked", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
    },
  });

  if (isLoading) return <PageLoader />;
  if (error || !customer)
    return <ErrorDisplay message="Failed to load customer." onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
            <p className="text-sm text-slate-500">{customer.email} &bull; {customer.phone}</p>
          </div>
        </div>
        {canEdit("customers") && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toggleBlock.mutate()}>
              {customer.isBlocked ? (
                <>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Unblock
                </>
              ) : (
                <>
                  <Ban className="mr-1 h-4 w-4" />
                  Block
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Credit Limit</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(customer.creditLimit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Credit Used</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">{formatCurrency(customer.creditBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Available Credit</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {formatCurrency(customer.creditLimit - customer.creditBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium">Address</p>
              <p className="mt-1 text-sm">{customer.address || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium">Status</p>
              <Badge variant={customer.isBlocked ? "danger" : "success"} className="mt-1">
                {customer.isBlocked ? "Blocked" : "Active"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium">Created</p>
              <p className="mt-1 text-sm">{formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          {salesHistory?.data && salesHistory?.data?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesHistory?.data?.map((sale) => (
                  <TableRow
                    key={sale.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/sales/${sale.id}`)}
                  >
                    <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                    <TableCell>{formatDate(sale.createdAt)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.totalAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.paidAmount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={sale.status === "paid" ? "success" : sale.status === "partial" ? "warning" : "danger"}
                        className="capitalize"
                      >
                        {sale.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-4 text-center text-sm text-slate-400">No sales history</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
