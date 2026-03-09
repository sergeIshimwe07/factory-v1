"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Clock,
  AlertTriangle,
  Package,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Calendar,
  User,
  TrendingUp,
  Zap,
  ChevronRight,
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
  Area,
  AreaChart,
} from "recharts";
import { useAuthStore } from "@/lib/auth";
import { useDashboardStore } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorDisplay } from "@/components/ui/error-display";
import { formatCurrency, formatNumber } from "@/utils/formatters";

const ACCENT = "#C9A84C";
const ACCENT_LIGHT = "#E8C97A";
const COLORS = ["#C9A84C", "#4C8EC9", "#4CC9A8", "#C94C6E", "#8B4CC9"];

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

const PIE_DATA = [
  { name: "Electronics", value: 35 },
  { name: "Machinery", value: 25 },
  { name: "Parts", value: 20 },
  { name: "Materials", value: 15 },
  { name: "Other", value: 5 },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { summary, isLoading, error, fetchSummary } = useDashboardStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchSummary();
    setMounted(true);
  }, [fetchSummary]);

  if (error) {
    return <ErrorDisplay message="Failed to load dashboard data." onRetry={() => fetchSummary()} />;
  }

  return (
    <div className="dash-root">
        {/* Header */}
        <div className="dash-header">
          <div>
            <div className="dash-eyebrow">Command Center</div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">
              Welcome back, {user?.name || "User"} &nbsp;·&nbsp;{" "}
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <button className="dash-date-btn">
            <Calendar size={13} />
            This Week
          </button>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid ">
          {[
            { n: "01", label: "Total Sales", value: summary ? formatCurrency(summary?.totalSalesMonth || 0) : "—", trend: { v: 12.5, d: "up" }, icon: <ShoppingCart size={15} /> },
            { n: "02", label: "Orders Today", value: summary ? formatNumber(Math.floor(Math.random() * 50) + 20) : "—", trend: { v: 8.2, d: "up" }, icon: <Zap size={15} /> },
            { n: "03", label: "Pending Orders", value: summary ? formatNumber(Math.floor(Math.random() * 20) + 5) : "—", trend: { v: 3.1, d: "down" }, icon: <Clock size={15} /> },
            { n: "04", label: "Low Stock Items", value: summary ? formatNumber(summary?.lowStockAlerts?.length) : "—", trend: { v: 5.4, d: "up" }, icon: <AlertTriangle size={15} /> },
          ].map((card, i) => (
            <div className="kpi-card shadow rounded-lg " key={i} style={{ animationDelay: `${i * 0.07}s`, animation: "fadeSlideUp 0.6s ease both" }}>
              <div className="kpi-card-number">{card.n}</div>
              <div className="kpi-icon-wrap">
                <span style={{ color: ACCENT }}>{card.icon}</span>
              </div>
              <div className="kpi-label">{card.label}</div>
              {isLoading ? (
                <div style={{ height: "2.25rem", width: "8rem", background: "var(--surface-3)", marginBottom: "0.75rem" }} />
              ) : (
                <div className="kpi-value">{card.value}</div>
              )}
              <div className="kpi-trend" style={{ color: card.trend.d === "up" ? "var(--green)" : "var(--red)" }}>
                {card.trend.d === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                <span>{card.trend.v}%</span>
                <span style={{ color: "var(--text-muted)", fontWeight: 300 }}>vs last period</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="charts-grid">
          {/* Sales Trend */}
          <div className="chart-card wide">
            <div className="chart-header">
              <div className="chart-title">
                <span className="chart-title-dot" />
                Sales Trend
              </div>
              <button className="chart-more-btn"><MoreVertical size={14} /></button>
            </div>
            <div className="chart-body">
              {isLoading ? (
                <div style={{ height: 280, background: "var(--surface-2)" }} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={SALES_TREND_DATA}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280", fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6B7280", fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#181C23", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 0, fontFamily: "'DM Mono', monospace", fontSize: 11 }}
                      formatter={(value) => [formatCurrency(value as number), ""]}
                      labelStyle={{ color: ACCENT }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke={ACCENT} strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ fill: ACCENT, r: 4, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="target" stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">
                <span className="chart-title-dot" style={{ background: "#4C8EC9" }} />
                Categories
              </div>
            </div>
            <div className="chart-body">
              {isLoading ? (
                <div style={{ height: 160, background: "var(--surface-2)" }} />
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#181C23", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 0, fontFamily: "'DM Mono', monospace", fontSize: 11 }}
                      formatter={(v) => [`${v}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="pie-legend">
                {PIE_DATA.map((d, i) => (
                  <div className="pie-legend-item" key={i}>
                    <span className="pie-legend-dot" style={{ background: COLORS[i] }} />
                    <span className="pie-legend-name">{d.name}</span>
                    <span className="pie-legend-val">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lower Row */}
        <div className="lower-grid">
          {/* Transactions */}
          <div className="chart-card wide">
            <div className="chart-header">
              <div className="chart-title">
                <span className="chart-title-dot" />
                Recent Transactions
              </div>
              <button className="chart-more-btn" style={{ display: "flex", alignItems: "center", gap: 4, width: "auto", padding: "0 8px", fontSize: 11, fontFamily: "'DM Mono', monospace", color: ACCENT, borderColor: "var(--border-gold)" }}>
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="chart-body" style={{ paddingTop: "0.5rem" }}>
              {RECENT_TRANSACTIONS.map((tx) => (
                <div className="tx-row" key={tx.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                    <div className="tx-avatar">
                      <User size={14} color="var(--text-muted)" />
                    </div>
                    <div>
                      <div className="tx-id">{tx.id}</div>
                      <div className="tx-customer">{tx.customer}</div>
                      <div className="tx-meta">{tx.date}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div className="tx-amount">{formatCurrency(tx.amount)}</div>
                    <div className={`tx-badge ${tx.status}`}>
                      {tx.status === "completed" ? <CheckCircle size={9} /> : <Clock size={9} />}
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">
                <span className="chart-title-dot" style={{ background: "#34D399" }} />
                Performance
              </div>
            </div>
            <div className="chart-body" style={{ paddingTop: "0.25rem" }}>
              {[
                { label: "Conversion Rate", value: "68.5%", pct: 68.5, trend: { v: 4.2, d: "up" } },
                { label: "Avg Order Value", value: formatCurrency(125000), pct: 72, trend: { v: 2.1, d: "up" } },
                { label: "Fulfillment Rate", value: "94.2%", pct: 94.2, trend: { v: 1.5, d: "up" } },
                { label: "Return Rate", value: "2.3%", pct: 2.3, trend: { v: 0.5, d: "down" } },
              ].map((s, i) => (
                <div className="qs-row" key={i}>
                  <div style={{ flex: 1 }}>
                    <div className="qs-label">{s.label}</div>
                    <div className="qs-value">{s.value}</div>
                    <div className="qs-bar-track">
                      <div className="qs-bar-fill" style={{ width: `${s.pct}%`, background: i === 3 ? "var(--red)" : "var(--gold)" }} />
                    </div>
                  </div>
                  <div style={{ marginLeft: "1rem", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.72rem", fontWeight: 600, color: s.trend.d === "up" ? "var(--green)" : "var(--red)" }}>
                    {s.trend.d === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {s.trend.v}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {summary && summary?.lowStockAlerts?.length > 0 && (
          <div className="section-wrap">
            <div className="section-header">
              <AlertTriangle size={15} color="var(--red)" />
              <span className="section-header-title">Low Stock Alerts</span>
              <span className="section-count">{summary.lowStockAlerts.length} items</span>
            </div>
            <div className="stock-grid">
              {summary.lowStockAlerts.slice(0, 6).map((item) => {
                const pct = Math.round((item.currentStock / item.minimumStock) * 100);
                return (
                  <div className="stock-item" key={item.productId}>
                    <div className="stock-name">{item.productName}</div>
                    <div className="stock-bar-track">
                      <div className="stock-bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <div className="stock-numbers">
                      <span style={{ color: "var(--red)" }}>Stock: {item.currentStock}</span>
                      <span style={{ color: "var(--text-muted)" }}>Min: {item.minimumStock}</span>
                      <span style={{ color: ACCENT }}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
  );
}