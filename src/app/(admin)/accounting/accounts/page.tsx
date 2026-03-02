"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Account } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/utils/formatters";

export default function AccountsPage() {
  const { data: accounts, isLoading } = useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data } = await api.get("/accounting/accounts");
      return data.data ?? data;
    },
  });

  const totalAssets =
    accounts?.filter((a) => a.type === "asset").reduce((s, a) => s + a.balance, 0) ?? 0;
  const totalLiabilities =
    accounts?.filter((a) => a.type === "liability").reduce((s, a) => s + a.balance, 0) ?? 0;
  const totalEquity =
    accounts?.filter((a) => a.type === "equity").reduce((s, a) => s + a.balance, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chart of Accounts</h1>
        <p className="text-sm text-slate-500">Account balances overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Total Assets</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(totalAssets)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Total Liabilities</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Total Equity</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{formatCurrency(totalEquity)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : accounts && accounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((acct) => (
                  <TableRow key={acct.id}>
                    <TableCell className="font-mono text-sm">{acct.code}</TableCell>
                    <TableCell className="font-medium">{acct.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          acct.type === "asset"
                            ? "success"
                            : acct.type === "liability"
                              ? "danger"
                              : acct.type === "revenue"
                                ? "info"
                                : acct.type === "expense"
                                  ? "warning"
                                  : "default"
                        }
                        className="capitalize"
                      >
                        {acct.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(acct.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No accounts found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
