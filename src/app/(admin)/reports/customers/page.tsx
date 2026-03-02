"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Printer } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate, downloadBlob } from "@/utils/formatters";

interface StatementLine {
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface CustomerStatement {
  customerName: string;
  openingBalance: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  lines: StatementLine[];
}

export default function CustomerStatementPage() {
  const [customerId, setCustomerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: customers } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["customers-list"],
    queryFn: async () => {
      const { data } = await api.get("/customers", { params: { limit: 500 } });
      return data.data ?? data;
    },
  });

  const { data: statement, isLoading } = useQuery<CustomerStatement>({
    queryKey: ["report-customer-statement", customerId, startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get(`/reports/customer-statement/${customerId}`, {
        params: { startDate, endDate },
      });
      return data.data ?? data;
    },
    enabled: !!customerId,
  });

  const handleExportCSV = async () => {
    const { data: blob } = await api.get(`/reports/customer-statement/${customerId}/export`, {
      params: { startDate, endDate, format: "csv" },
      responseType: "blob",
    });
    downloadBlob(blob, `statement-${statement?.customerName || customerId}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Statement</h1>
          <p className="text-sm text-slate-500">Account statement per customer</p>
        </div>
        {statement && (
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
          <div className="flex items-center gap-3 flex-wrap">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Customer</label>
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-56">
                <option value="">Select customer</option>
                {customers?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">From</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">To</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {statement && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Opening Balance</p>
                <p className="mt-1 text-xl font-bold">{formatCurrency(statement.openingBalance)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Total Debit</p>
                <p className="mt-1 text-xl font-bold text-red-600">{formatCurrency(statement.totalDebit)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Total Credit</p>
                <p className="mt-1 text-xl font-bold text-green-600">{formatCurrency(statement.totalCredit)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Closing Balance</p>
                <p className="mt-1 text-xl font-bold">{formatCurrency(statement.closingBalance)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statement — {statement.customerName}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
              ) : statement.lines.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.lines.map((line, i) => (
                      <TableRow key={i}>
                        <TableCell>{formatDate(line.date)}</TableCell>
                        <TableCell className="font-medium">{line.reference}</TableCell>
                        <TableCell>{line.description}</TableCell>
                        <TableCell className="text-right text-red-600">
                          {line.debit ? formatCurrency(line.debit) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {line.credit ? formatCurrency(line.credit) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(line.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-8 text-center text-sm text-slate-400">No transactions in this period.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!customerId && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-400">
            Select a customer to view their statement.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
