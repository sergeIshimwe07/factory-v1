"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer, Download, FileText } from "lucide-react";
import api from "@/lib/api";
import type { Sale, Payment } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageLoader } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/formatters";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: sale, isLoading, error, refetch } = useQuery<Sale>({
    queryKey: ["sale", id],
    queryFn: async () => {
      const { data } = await api.get(`/sales/${id}`);
      return data;
    },
  });

  const { data: payments } = useQuery<Payment[]>({
    queryKey: ["sale-payments", id],
    queryFn: async () => {
      const { data } = await api.get(`/sales/${id}/payments`);
      return data;
    },
    enabled: !!sale,
  });

  if (isLoading) return <PageLoader />;
  if (error || !sale)
    return <ErrorDisplay message="Failed to load sale details." onRetry={() => refetch()} />;

  const statusVariant =
    sale.status === "paid" ? "success" : sale.status === "partial" ? "warning" : "danger";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Invoice #{sale.invoiceNumber}</h1>
            <p className="text-sm text-slate-500">{formatDateTime(sale.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Invoice Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Customer</p>
              <p className="mt-1 font-medium text-slate-900">{sale.customerName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Sales Agent</p>
              <p className="mt-1 font-medium text-slate-900">{sale.agentName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Status</p>
              <Badge variant={statusVariant} className="mt-1 capitalize">
                {sale.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" />
            Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.discount)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-col items-end space-y-1 border-t pt-4">
            <div className="flex w-full max-w-xs justify-between text-sm">
              <span className="text-slate-500">Subtotal:</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex w-full max-w-xs justify-between text-sm">
              <span className="text-slate-500">Discount:</span>
              <span className="text-red-600">-{formatCurrency(sale.totalDiscount)}</span>
            </div>
            <div className="flex w-full max-w-xs justify-between border-t pt-2 text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(sale.totalAmount)}</span>
            </div>
            <div className="flex w-full max-w-xs justify-between text-sm">
              <span className="text-slate-500">Paid:</span>
              <span className="text-green-600">{formatCurrency(sale.paidAmount)}</span>
            </div>
            <div className="flex w-full max-w-xs justify-between text-sm font-medium">
              <span className="text-slate-500">Balance:</span>
              <span className="text-yellow-600">
                {formatCurrency(sale.totalAmount - sale.paidAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.createdAt)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(p.amount)}</TableCell>
                    <TableCell className="capitalize">{p.method}</TableCell>
                    <TableCell>{p.reference || "—"}</TableCell>
                    <TableCell>{p.createdBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-4 text-center text-sm text-slate-400">No payments recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
