"use client";

import React, { useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Package,
  ShoppingCart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuthStore } from "@/lib/auth";
import { useDashboardStore } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorDisplay } from "@/components/ui/error-display";
import { formatCurrency, formatNumber } from "@/utils/formatters";

const COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1"];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { summary, isLoading, error, fetchSummary } = useDashboardStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (error) {
    return <ErrorDisplay message="Failed to load dashboard data." onRetry={() => fetchSummary()} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Welcome back, {user?.name || "User"}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Sales Today"
          value={summary ? formatCurrency(summary.totalSalesToday) : undefined}
          icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Sales This Month"
          value={summary ? formatCurrency(summary.totalSalesMonth) : undefined}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Outstanding Credit"
          value={summary ? formatCurrency(summary.outstandingCredit) : undefined}
          icon={<CreditCard className="h-5 w-5 text-yellow-600" />}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Low Stock Items"
          value={summary ? formatNumber(summary.lowStockAlerts.length) : undefined}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 5 Products Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5 text-slate-500" />
              Top 5 Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : summary?.topProducts && summary.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={summary.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="productName"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-slate-400">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commission Summary (if agent) */}
        {user?.role === "sales_agent" && summary?.commissionSummary ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5 text-slate-500" />
                Commission Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Paid", value: summary.commissionSummary.paid },
                      { name: "Unpaid", value: summary.commissionSummary.unpaid },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ""}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {[0, 1].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-center gap-6 text-sm">
                <span className="text-green-700">
                  Paid: {formatCurrency(summary.commissionSummary.paid)}
                </span>
                <span className="text-yellow-700">
                  Unpaid: {formatCurrency(summary.commissionSummary.unpaid)}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5 text-slate-500" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <div className="flex h-[250px] flex-col items-center justify-center text-sm text-slate-400">
                  <DollarSign className="mb-2 h-10 w-10 text-slate-300" />
                  Revenue chart data loads from your sales API
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : summary?.lowStockAlerts && summary.lowStockAlerts.length > 0 ? (
            <div className="space-y-2">
              {summary.lowStockAlerts.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-md border border-red-100 bg-red-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                    <p className="text-xs text-slate-500">
                      Min: {item.minimumStock} units
                    </p>
                  </div>
                  <Badge variant="danger">
                    Stock: {item.currentStock}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-slate-400">No low stock alerts</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  isLoading,
}: {
  title: string;
  value?: string;
  icon: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-28" />
            ) : (
              <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            )}
          </div>
          <div className="rounded-full bg-slate-100 p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
