"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Printer } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate, downloadBlob } from "@/utils/formatters";

interface SalesReportRow {
  date: string;
  invoiceNumber: string;
  customerName: string;
  agentName: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
}

interface SalesReportSummary {
  totalSales: number;
  totalPaid: number;
  totalOutstanding: number;
  count: number;
  rows: SalesReportRow[];
}

export default function SalesReportPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useQuery<SalesReportSummary>({
    queryKey: ["report-sales", startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await api.get("/reports/sales", { params });
      return data.data ?? data;
    },
    enabled: !!startDate && !!endDate,
  });

  const handleExportCSV = async () => {
    const { data: blob } = await api.get("/reports/sales/export", {
      params: { startDate, endDate, format: "csv" },
      responseType: "blob",
    });
    downloadBlob(blob, `sales-report-${startDate}-${endDate}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Report</h1>
          <p className="text-sm text-slate-500">Detailed sales analysis by date range</p>
        </div>
        <div className="flex gap-2">
          {data && (
            <>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-1 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-1 h-4 w-4" />
                Print
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Total Sales</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(data.totalSales)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Total Paid</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(data.totalPaid)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Outstanding</p>
                <p className="mt-1 text-2xl font-bold text-red-600">{formatCurrency(data.totalOutstanding)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Transactions</p>
                <p className="mt-1 text-2xl font-bold">{data.count}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rows.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{formatDate(row.date)}</TableCell>
                        <TableCell className="font-medium">{row.invoiceNumber}</TableCell>
                        <TableCell>{row.customerName}</TableCell>
                        <TableCell>{row.agentName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.totalAmount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.paidAmount)}</TableCell>
                        <TableCell className="capitalize">{row.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!data && startDate && endDate && isLoading && (
        <div className="flex justify-center p-12"><Spinner /></div>
      )}

      {!startDate || !endDate ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-400">
            Select a date range to generate the report.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
