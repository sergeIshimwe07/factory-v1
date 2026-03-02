"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Printer } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatNumber, formatDate, downloadBlob } from "@/utils/formatters";

interface ProductionReportRow {
  date: string;
  finishedProduct: string;
  quantityProduced: number;
  materialsUsed: { name: string; quantity: number }[];
  status: string;
}

interface ProductionReportSummary {
  totalEntries: number;
  totalUnitsProduced: number;
  rows: ProductionReportRow[];
}

export default function ProductionReportPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useQuery<ProductionReportSummary>({
    queryKey: ["report-production", startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await api.get("/reports/production", { params });
      return data.data ?? data;
    },
    enabled: !!startDate && !!endDate,
  });

  const handleExportCSV = async () => {
    const { data: blob } = await api.get("/reports/production/export", {
      params: { startDate, endDate, format: "csv" },
      responseType: "blob",
    });
    downloadBlob(blob, `production-report-${startDate}-${endDate}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Production Report</h1>
          <p className="text-sm text-slate-500">Production output and materials usage</p>
        </div>
        {data && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-1 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Start Date</label>
              <input
                type="date"
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">End Date</label>
              <input
                type="date"
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Total Entries</p>
                <p className="mt-1 text-2xl font-bold">{data.totalEntries}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Total Units Produced</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">{formatNumber(data.totalUnitsProduced)}</p>
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
                      <TableHead>Finished Product</TableHead>
                      <TableHead className="text-right">Qty Produced</TableHead>
                      <TableHead>Materials Used</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rows.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{formatDate(row.date)}</TableCell>
                        <TableCell className="font-medium">{row.finishedProduct}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.quantityProduced)}</TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            {row.materialsUsed.map((m, j) => (
                              <p key={j} className="text-xs text-slate-500">
                                {m.name}: <span className="font-medium">{formatNumber(m.quantity)}</span>
                              </p>
                            ))}
                          </div>
                        </TableCell>
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

      {(!startDate || !endDate) && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-400">
            Select a date range to generate the report.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
