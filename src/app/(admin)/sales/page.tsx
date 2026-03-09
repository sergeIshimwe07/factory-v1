"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Eye, Printer, Filter, X, SlidersHorizontal } from "lucide-react";
import api from "@/lib/api";
import type { Sale, PaginatedResponse, SalesFilter } from "@/types";
import { DataTable, type Column } from "@/components/tables";
import { SearchInput } from "@/components/ui/search-input";
import { usePermissions } from "@/hooks";
import { formatCurrency, formatDate } from "@/utils/formatters";

// ─── Design tokens (matches dashboard + sidebar) ──────────────────────────────
const T = {
  gold:       "#C9A84C",
  goldLight:  "#E8C97A",
  goldDim:    "rgba(201,168,76,0.12)",
  goldBorder: "rgba(201,168,76,0.22)",
  bg:         "#0A0C10",
  surface:    "#111318",
  surface2:   "#181C23",
  surface3:   "#1E2330",
  border:     "rgba(255,255,255,0.07)",
  text:       "#F0EDE8",
  textDim:    "#9CA3AF",
  textMuted:  "#525866",
  green:      "#34D399",
  amber:      "#FBBF24",
  red:        "#F87171",
} as const;

const fonts = {
  display: "'Cormorant Garamond', serif",
  mono:    "'DM Mono', monospace",
  body:    "'Outfit', sans-serif",
};

// ─── Tiny local primitives (avoids importing light-mode shadcn components) ────

function LuxButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  style: extraStyle,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "md" | "sm" | "icon";
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);

  const base: React.CSSProperties = {
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            "0.4rem",
    cursor:         "pointer",
    fontFamily:     fonts.mono,
    fontSize:       size === "sm" ? "0.62rem" : "0.65rem",
    letterSpacing:  "0.12em",
    textTransform:  "uppercase",
    transition:     "all 0.15s",
    border:         "1px solid transparent",
    whiteSpace:     "nowrap",
    ...extraStyle,
  };

  const sizeStyles: React.CSSProperties =
    size === "icon" ? { width: 30, height: 30, padding: 0 } :
    size === "sm"   ? { padding: "0.35rem 0.9rem" } :
                     { padding: "0.5rem 1.2rem" };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background:   hovered ? "rgba(201,168,76,0.25)" : T.goldDim,
      borderColor:  hovered ? T.gold : T.goldBorder,
      color:        T.goldLight,
    },
    outline: {
      background:   hovered ? T.surface2 : "transparent",
      borderColor:  hovered ? "rgba(255,255,255,0.15)" : T.border,
      color:        hovered ? T.text : T.textDim,
    },
    ghost: {
      background:   hovered ? T.surface2 : "transparent",
      borderColor:  "transparent",
      color:        hovered ? T.gold : T.textMuted,
    },
    danger: {
      background:   hovered ? "rgba(248,113,113,0.12)" : "transparent",
      borderColor:  hovered ? "rgba(248,113,113,0.3)" : T.border,
      color:        hovered ? T.red : T.textMuted,
    },
  };

  return (
    <button
      onClick={onClick}
      style={{ ...base, ...sizeStyles, ...variantStyles[variant] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

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
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
        <label style={{ display: "block", fontFamily: fonts.mono, fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.4rem" }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:        "100%",
          background:   T.surface3,
          border:       `1px solid ${focused ? T.goldBorder : T.border}`,
          color:        T.text,
          fontFamily:   fonts.mono,
          fontSize:     "0.75rem",
          padding:      "0.5rem 0.75rem",
          outline:      "none",
          transition:   "border-color 0.15s",
          colorScheme:  "dark",
        }}
      />
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; bg: string; border: string }> = {
    paid:     { color: T.green, bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)" },
    partial:  { color: T.amber, bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)" },
    unpaid:   { color: T.red,   bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
    default:  { color: T.textDim, bg: T.surface3, border: T.border },
  };
  const s = cfg[status] ?? cfg.default;
  return (
    <span style={{
      display:       "inline-flex",
      alignItems:    "center",
      fontFamily:    fonts.mono,
      fontSize:      "0.58rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color:         s.color,
      background:    s.bg,
      border:        `1px solid ${s.border}`,
      padding:       "0.2rem 0.55rem",
    }}>
      {status}
    </span>
  );
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
        <span style={{ fontFamily: fonts.display, fontSize: "1rem", fontWeight: 500, color: T.text }}>
          {formatCurrency(item.totalAmount as number)}
        </span>
      ),
    },
    { key: "paidAmount",    label: "Paid",   render: (item) => (
        <span style={{ fontFamily: fonts.display, fontSize: "1rem", color: T.textDim }}>
          {formatCurrency(item.paidAmount as number)}
        </span>
      ),
    },
    { key: "status",        label: "Status", render: (item) => <StatusBadge status={item.status as string} /> },
    { key: "createdAt",     label: "Date",   render: (item) => (
        <span style={{ fontFamily: fonts.mono, fontSize: "0.7rem", color: T.textMuted }}>
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
            onClick={(e: any) => { e?.stopPropagation(); router.push(`/sales/${item.id}`); }}
          >
            <Eye size={13} />
          </LuxButton>
          <LuxButton
            variant="ghost"
            size="icon"
            onClick={(e: any) => { e?.stopPropagation(); window.print(); }}
          >
            <Printer size={13} />
          </LuxButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');

        .sales-filter-panel {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.3s ease, opacity 0.3s ease;
          opacity: 0;
        }
        .sales-filter-panel.open {
          max-height: 300px;
          opacity: 1;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          cursor: pointer;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: fonts.body, color: T.text, padding: "2rem 2.5rem", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingBottom: "1.75rem", borderBottom: `1px solid ${T.border}`, marginBottom: "2rem", position: "relative" }}>
          <span style={{ position: "absolute", bottom: -1, left: 0, width: 96, height: 1, background: T.gold }} />
          <div>
            <p style={{ fontFamily: fonts.mono, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, marginBottom: "0.5rem" }}>
              Revenue
            </p>
            <h1 style={{ fontFamily: fonts.display, fontSize: "3rem", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: T.text }}>
              Sales
            </h1>
            <p style={{ marginTop: "0.4rem", fontSize: "0.8rem", color: T.textMuted, fontWeight: 300, letterSpacing: "0.02em" }}>
              Manage sales orders and invoices
            </p>
          </div>
          {canCreate("sales") && (
            <LuxButton onClick={() => router.push("/sales/new")}>
              <Plus size={13} />
              New Sale
            </LuxButton>
          )}
        </div>

        {/* ── Panel ── */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderTop: `1px solid ${T.goldBorder}`, overflow: "hidden" }}>

          {/* Panel header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, display: "inline-block" }} />
              <span style={{ fontFamily: fonts.display, fontSize: "1.15rem", fontWeight: 500, color: T.text }}>
                Sales List
              </span>
              {data?.total !== undefined && (
                <span style={{ fontFamily: fonts.mono, fontSize: "0.6rem", letterSpacing: "0.1em", color: T.textMuted, background: T.surface3, border: `1px solid ${T.border}`, padding: "0.15rem 0.5rem" }}>
                  {data.total} records
                </span>
              )}
            </div>
            <LuxButton
              variant={showFilters ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal size={11} />
              Filters
              {hasActiveFilters && (
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.gold, display: "inline-block" }} />
              )}
            </LuxButton>
          </div>

          {/* Filter panel */}
          <div className={`sales-filter-panel${showFilters ? " open" : ""}`}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}`, background: T.surface2 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                <LuxInput label="From Date" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <LuxInput label="To Date"   type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)} />
                <LuxInput label="Agent"     placeholder="Search agent..."    value={agentFilter}    onChange={(e) => setAgentFilter(e.target.value)} />
                <LuxInput label="Customer"  placeholder="Search customer..." value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <LuxButton size="sm" onClick={applyFilters}>Apply</LuxButton>
                <LuxButton size="sm" variant="outline" onClick={clearFilters}>
                  <X size={10} /> Clear
                </LuxButton>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ padding: "0" }}>
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
    </>
  );
}