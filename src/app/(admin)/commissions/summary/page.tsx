"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/utils/formatters";

interface AgentSummary {
  agentId: string;
  agentName: string;
  totalEarned: number;
  totalPaid: number;
  totalUnpaid: number;
  count: number;
}

export default function CommissionSummaryPage() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const { data: summary, isLoading } = useQuery<AgentSummary[]>({
    queryKey: ["commission-summary", month],
    queryFn: async () => {
      const { data } = await api.get("/commissions/summary", { params: { month } });
      return data.data ?? data;
    },
  });

  const grandTotal = summary?.reduce((s, a) => s + a.totalEarned, 0) ?? 0;
  const grandPaid = summary?.reduce((s, a) => s + a.totalPaid, 0) ?? 0;
  const grandUnpaid = summary?.reduce((s, a) => s + a.totalUnpaid, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commission Summary</h1>
          <p className="text-sm text-slate-500">Monthly aggregated commissions per agent</p>
        </div>
        <input
          type="month"
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Total Earned</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(grandTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Total Paid</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(grandPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Total Unpaid</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">{formatCurrency(grandUnpaid)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per-Agent Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : summary && summary.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Total Earned</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Unpaid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((agent) => (
                  <TableRow key={agent.agentId}>
                    <TableCell className="font-medium">{agent.agentName}</TableCell>
                    <TableCell className="text-right">{agent.count}</TableCell>
                    <TableCell className="text-right">{formatCurrency(agent.totalEarned)}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(agent.totalPaid)}
                    </TableCell>
                    <TableCell className="text-right text-yellow-600">
                      {formatCurrency(agent.totalUnpaid)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No commission data for this month.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
