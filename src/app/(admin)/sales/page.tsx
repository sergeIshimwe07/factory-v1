"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Eye, Printer, X, SlidersHorizontal } from "lucide-react";
import api from "@/lib/api";
import type { Sale, PaginatedResponse, SalesFilter } from "@/types";
import { DataTable, type Column } from "@/components/tables";
import { usePermissions } from "@/hooks";
import { formatCurrency, formatDate } from "@/utils/formatters";

// ─── Simple Button Component ────────────────────────────────────────────────
function LuxButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "md" | "sm" | "icon";
  className?: string;
}) {
  const classNames = `lux-btn ${variant} ${size} ${className}`.trim();
  return (
    <button onClick={onClick} className={classNames}>
      {children}
    </button>
  );
}

// ─── Simple Input Component ────────────────────────────────────────────────
function LuxInput({
  type = "text",
  value,
  onChange,
  placeholder,
  label,
}: {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="lux-input-wrapper">
      {label && <label className="lux-input-label">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="lux-input"
      />
    </div>
  );
}

// ─── Status Badge Component ────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const statusClass = ["paid", "partial", "unpaid"].includes(status) ? status : "default";
  return <span className={`status-badge ${statusClass}`}>{status}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SalesListPage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const [filters, setFilters] = useState<SalesFilter>({ page: 1, limit: 10 });
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<Sale>>({
    queryKey: ["sales", filters],
    queryFn: async () => {
      const { data } = await api.get("/sales", { params: filters });
      return data;
    },
  });

  const applyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      page:       1,
      startDate:  dateFrom || undefined,
      endDate:    dateTo   || undefined,
      agentId:    agentFilter    || undefined,
      customerId: customerFilter || undefined,
    }));
  };

  const clearFilters = () => {
    setDateFrom(""); setDateTo("");
    setAgentFilter(""); setCustomerFilter("");
    setFilters({ page: 1, limit: 10 });
  };

  const hasActiveFilters = dateFrom || dateTo || agentFilter || customerFilter;

  const columns: Column<Sale & Record<string, unknown>>[] = [
    { key: "invoiceNumber", label: "Invoice #" },
    { key: "customerName",  label: "Customer" },
    { key: "agentName",     label: "Agent" },
    { key: "totalAmount",   label: "Total",  render: (item) => (
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 500, color: "var(--text)" }}>
          {formatCurrency(item.totalAmount as number)}
        </span>
      ),
    },
    { key: "paidAmount",    label: "Paid",   render: (item) => (
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "var(--text-dim)" }}>
          {formatCurrency(item.paidAmount as number)}
        </span>
      ),
    },
    { key: "status",        label: "Status", render: (item) => <StatusBadge status={item.status as string} /> },
    { key: "createdAt",     label: "Date",   render: (item) => (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--text-muted)" }}>
          {formatDate(item.createdAt as string)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <LuxButton
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/sales/${item.id}`)}
          >
            <Eye size={13} />
          </LuxButton>
          <LuxButton
            variant="ghost"
            size="icon"
            onClick={() => window.print()}
          >
            <Printer size={13} />
          </LuxButton>
        </div>
      ),
    },
  ];

  return (
    <div className="dash-root">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="header-eyebrow">Revenue</p>
          <h1 className="header-title">Sales</h1>
          <p className="header-subtitle">Manage sales orders and invoices</p>
        </div>
        {canCreate("sales") && (
          <LuxButton variant="primary" onClick={() => router.push("/sales/new")}>
            <Plus size={13} />
            New Sale
          </LuxButton>
        )}
      </div>

      {/* Panel */}
      <div className="panel">
        {/* Panel header */}
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" />
            <span className="panel-title-text">Sales List</span>
            {data?.total !== undefined && <span className="record-count">{data?.total} records</span>}
          </div>
          <LuxButton
            variant={showFilters ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={11} />
            Filters
            {hasActiveFilters && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />}
          </LuxButton>
        </div>

        {/* Filter panel */}
        <div className={`filter-panel${showFilters ? " open" : ""}`}>
          <div className="filter-section">
            <div className="sales-filter-grid">
              <LuxInput label="From Date" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <LuxInput label="To Date" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              <LuxInput label="Agent" placeholder="Search agent..." value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} />
              <LuxInput label="Customer" placeholder="Search customer..." value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} />
            </div>
            <div className="sales-filter-actions">
              <LuxButton size="sm" onClick={applyFilters}>Apply</LuxButton>
              <LuxButton size="sm" variant="outline" onClick={clearFilters}>
                <X size={10} /> Clear
              </LuxButton>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <DataTable
            columns={columns}
            data={(data?.data || []) as (Sale & Record<string, unknown>)[]}
            isLoading={isLoading}
            currentPage={filters.page}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total}
            pageSize={filters.limit}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            onRowClick={(item) => router.push(`/sales/${item.id}`)}
            emptyMessage="No sales found."
          />
        </div>
      </div>
    </div>
  );
}