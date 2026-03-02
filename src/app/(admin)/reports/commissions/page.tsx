"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Printer } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, downloadBlob } from "@/utils/formatters";

interface CommissionReportRow {
  agentName: string;
  salesCount: number;
  totalSalesAmount: number;
  totalCommission: number;
  paidCommission: number;
  unpaidCommission: number;
}

interface CommissionReportSummary {
  totalCommission: number;
  totalPaid: number;
  totalUnpaid: number;
  rows: CommissionReportRow[];
}

export default function CommissionReportPage() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const { data, isLoading } = useQuery<CommissionReportSummary>({
    queryKey: ["report-commissions", month],
    queryFn: async () => {
      const { data } = await api.get("/reports/commissions", { params: { month } });
      return data.data ?? data;
    },
  });

  const handleExportCSV = async () => {
    const { data: blob } = await api.get("/reports/commissions/export", {
      params: { month, format: "csv" },
      responseType: "blob",
    });
    downloadBlob(blob, `commission-report-${month}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commission Report</h1>
          <p className="text-sm text-slate-500">Monthly commission breakdown by agent</p>
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

      <div className="flex gap-3">
        <input
          type="month"
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Total Commission</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(data.totalCommission)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Paid</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(data.totalPaid)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Unpaid</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600">{formatCurrency(data.totalUnpaid)}</p>
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
                      <TableHead>Agent</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Sales Amount</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Unpaid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rows.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.agentName}</TableCell>
                        <TableCell className="text-right">{row.salesCount}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.totalSalesAmount)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(row.totalCommission)}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(row.paidCommission)}</TableCell>
                        <TableCell className="text-right text-yellow-600">{formatCurrency(row.unpaidCommission)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {isLoading && !data && (
        <div className="flex justify-center p-12"><Spinner /></div>
      )}
    </div>
  );
}
