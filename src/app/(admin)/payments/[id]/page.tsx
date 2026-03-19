"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer, Download } from "lucide-react";
import api from "@/lib/api";
import type { Payment } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: payment, isLoading, error, refetch } = useQuery<Payment>({
    queryKey: ["payment", id],
    queryFn: async () => {
      const { data } = await api.get(`/payments/${id}`);
      return data;
    },
  });

  if (isLoading) return <PageLoader />;
  if (error || !payment)
    return <ErrorDisplay message="Failed to load payment details." onRetry={() => refetch()} />;

  const methodLabels: Record<string, string> = {
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    cheque: "Cheque",
    mobile_money: "Mobile Money",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payment Receipt</h1>
            <p className="text-sm text-slate-500">{formatDateTime(payment.createdAt)}</p>
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

      {/* Payment Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Customer</p>
              <p className="mt-1 font-medium text-slate-900">{payment.customerName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Invoice</p>
              <p className="mt-1 font-medium text-slate-900">{payment.saleInvoice || `#${payment.saleId}`}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Payment Method</p>
              <Badge variant="info" className="mt-1 capitalize">
                {methodLabels[payment.method] || payment.method}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-sm text-slate-500">Amount Paid</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount)}</span>
            </div>
            {payment.reference && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Reference Number</span>
                <span className="font-mono text-sm font-medium">{payment.reference}</span>
              </div>
            )}
            {payment.notes && (
              <div>
                <p className="text-sm text-slate-500 mb-2">Notes</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{payment.notes}</p>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-sm text-slate-500">Recorded By</span>
              <span className="text-sm font-medium">{payment.createdBy || "System"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
