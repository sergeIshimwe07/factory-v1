"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, Download } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/utils/formatters";

interface ReportLine {
  label: string;
  amount: number;
  isTotal?: boolean;
}

interface FinancialReport {
  title: string;
  period: string;
  lines: ReportLine[];
  netTotal: number;
}

export default function AccountingReportsPage() {
  const [reportType, setReportType] = useState<"pnl" | "balance_sheet">("pnl");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const { data: report, isLoading } = useQuery<FinancialReport>({
    queryKey: ["accounting-report", reportType, month],
    queryFn: async () => {
      const { data } = await api.get(`/accounting/reports/${reportType}`, { params: { month } });
      return data.data ?? data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1>
          <p className="text-sm text-slate-500">Profit & Loss, Balance Sheet</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Select value={reportType} onChange={(e) => setReportType(e.target.value as "pnl" | "balance_sheet")} className="w-48">
          <option value="pnl">Profit & Loss</option>
          <option value="balance_sheet">Balance Sheet</option>
        </Select>
        <input
          type="month"
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {reportType === "pnl" ? "Profit & Loss Statement" : "Balance Sheet"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : report ? (
            <div>
              <p className="mb-4 text-sm text-slate-500">{report.period}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.lines.map((line, idx) => (
                    <TableRow key={idx} className={line.isTotal ? "border-t-2 font-bold" : ""}>
                      <TableCell className={line.isTotal ? "font-bold" : ""}>{line.label}</TableCell>
                      <TableCell className={`text-right ${line.isTotal ? "font-bold" : ""}`}>
                        {formatCurrency(line.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end border-t pt-4">
                <div className="text-right">
                  <p className="text-sm text-slate-500">
                    {reportType === "pnl" ? "Net Profit/Loss" : "Net Total"}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      report.netTotal >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(report.netTotal)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No data for selected period.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
