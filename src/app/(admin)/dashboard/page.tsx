"use client";

import React, { useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MoreVertical,
  Calendar,
  User,
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useAuthStore } from "@/lib/auth";
import { useDashboardStore } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorDisplay } from "@/components/ui/error-display";
import { formatCurrency, formatNumber } from "@/utils/formatters";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const SALES_TREND_DATA = [
  { date: "Mon", revenue: 12000, target: 15000 },
  { date: "Tue", revenue: 15500, target: 15000 },
  { date: "Wed", revenue: 18200, target: 15000 },
  { date: "Thu", revenue: 16800, target: 15000 },
  { date: "Fri", revenue: 21200, target: 15000 },
  { date: "Sat", revenue: 19500, target: 15000 },
  { date: "Sun", revenue: 14200, target: 15000 },
];

const RECENT_TRANSACTIONS = [
  { id: "SO-001", customer: "ABC Industries", amount: 125000, date: "2 hours ago", status: "completed" },
  { id: "SO-002", customer: "XYZ Corp", amount: 85500, date: "5 hours ago", status: "pending" },
  { id: "PO-001", customer: "Supplier A", amount: 45000, date: "1 day ago", status: "completed" },
  { id: "SO-003", customer: "Tech Solutions", amount: 156000, date: "2 days ago", status: "completed" },
];

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome back, {user?.name || "User"} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition text-sm font-medium">
            <Calendar className="h-4 w-4" />
            This Week
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Sales"
          value={summary ? formatCurrency(summary.totalSalesMonth) : undefined}
          trend={{ value: 12.5, direction: "up" }}
          icon={<ShoppingCart className="h-5 w-5" />}
          bgColor="from-blue-50 to-blue-100/50"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          isLoading={isLoading}
        />
        <KPICard
          title="Orders Today"
          value={summary ? formatNumber(Math.floor(Math.random() * 50) + 20) : undefined}
          trend={{ value: 8.2, direction: "up" }}
          icon={<ShoppingCart className="h-5 w-5" />}
          bgColor="from-green-50 to-green-100/50"
          iconBg="bg-green-100"
          iconColor="text-green-600"
          isLoading={isLoading}
        />
        <KPICard
          title="Pending Orders"
          value={summary ? formatNumber(Math.floor(Math.random() * 20) + 5) : undefined}
          trend={{ value: 3.1, direction: "down" }}
          icon={<Clock className="h-5 w-5" />}
          bgColor="from-amber-50 to-amber-100/50"
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          isLoading={isLoading}
        />
        <KPICard
          title="Low Stock Items"
          value={summary ? formatNumber(summary.lowStockAlerts.length) : undefined}
          trend={{ value: 5.4, direction: "up" }}
          icon={<AlertTriangle className="h-5 w-5" />}
          bgColor="from-red-50 to-red-100/50"
          iconBg="bg-red-100"
          iconColor="text-red-600"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Trend Chart - Spans 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Sales Trend
              </CardTitle>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                <MoreVertical className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={SALES_TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip 
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#fff",
                    }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                  <Line type="monotone" dataKey="target" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Products Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5 text-purple-600" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Electronics", value: 35 },
                      { name: "Machinery", value: 25 },
                      { name: "Parts", value: 20 },
                      { name: "Materials", value: 15 },
                      { name: "Other", value: 5 },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={{ fontSize: 12 }}
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lower Row: Recent Transactions & Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-slate-600" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_TRANSACTIONS.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <QuickStat label="Conversion Rate" value="68.5%" trend={{ value: 4.2, direction: "up" }} />
            <QuickStat label="Avg Order Value" value={formatCurrency(125000)} trend={{ value: 2.1, direction: "up" }} />
            <QuickStat label="Fulfillment Rate" value="94.2%" trend={{ value: 1.5, direction: "up" }} />
            <QuickStat label="Return Rate" value="2.3%" trend={{ value: 0.5, direction: "down" }} />
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {summary && summary.lowStockAlerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Low Stock Alerts ({summary.lowStockAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {summary.lowStockAlerts.slice(0, 6).map((item) => (
                <div
                  key={item.productId}
                  className="rounded-lg border border-amber-200 bg-white p-3 hover:shadow-md transition"
                >
                  <p className="font-medium text-sm text-slate-900">{item.productName}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-600">
                      Stock: <span className="font-bold text-red-600">{item.currentStock}</span> / Min: {item.minimumStock}
                    </span>
                    <Badge variant="warning" className="text-xs">
                      {Math.round((item.currentStock / item.minimumStock) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KPICard({
  title,
  value,
  trend,
  icon,
  bgColor,
  iconBg,
  iconColor,
  isLoading,
}: {
  title: string;
  value?: string;
  trend: { value: number; direction: "up" | "down" };
  icon: React.ReactNode;
  bgColor: string;
  iconBg: string;
  iconColor: string;
  isLoading: boolean;
}) {
  return (
    <Card className={`bg-gradient-to-br ${bgColor} border-0`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            {isLoading ? (
              <Skeleton className="mt-3 h-8 w-32" />
            ) : (
              <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            )}
            <div className="mt-3 flex items-center gap-1">
              {trend.direction === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-xs font-semibold ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend.value}%
              </span>
              <span className="text-xs text-slate-500">vs last period</span>
            </div>
          </div>
          <div className={`rounded-lg ${iconBg} p-3`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: { id: string; customer: string; amount: number; date: string; status: string };
}) {
  const statusConfig = {
    completed: { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle },
    pending: { bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  };
  const config = statusConfig[transaction.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition">
      <div className="flex items-center gap-3 flex-1">
        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <User className="h-5 w-5 text-slate-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-900">{transaction.customer}</p>
          <p className="text-xs text-slate-500">{transaction.id} • {transaction.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-sm font-bold text-slate-900">{formatCurrency(transaction.amount)}</p>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
          <StatusIcon className="h-3 w-3" />
          {transaction.status}
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: { value: number; direction: "up" | "down" };
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {trend.direction === "up" ? (
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-xs font-semibold ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend.value}%
          </span>
        </div>
      </div>
    </div>
  );
}
