"use client";

import React from "react";
import { Pagination } from "./pagination";
import { ChevronRight } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

// ─── Light mode design tokens ─────────────────────────────────────────────────
const T = {
  gold:        "#B5611F",
  goldLight:   "#C2622D",
  goldDim:     "rgba(181, 97, 31, 0.08)",
  goldBorder:  "rgba(181, 97, 31, 0.20)",
  bg:          "#F5F2EE",      // warm stone page bg — used for thead
  surface:     "#FFFFFF",      // card / panel
  surface2:    "#F9F7F4",      // hover states
  surface3:    "#F0EDE8",      // input fills, skeleton bars
  border:      "rgba(0, 0, 0, 0.07)",
  text:        "#1C1917",      // stone-900
  textDim:     "#78716C",      // stone-500
  textMuted:   "#A8A29E",      // stone-400
  red:         "#DC2626",
  green:       "#059669",
} as const;

const fonts = {
  display: "'Cormorant Garamond', serif",
  mono:    "'DM Mono', monospace",
  body:    "'Outfit', sans-serif",
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  onRowClick,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {

  const wrapStyle: React.CSSProperties = {
    background:   T.surface,
    border:       `1px solid ${T.border}`,
    borderTop:    `2px solid ${T.gold}`,       // solid terracotta top accent
    fontFamily:   fonts.body,
    color:        T.text,
    overflow:     "hidden",
    boxShadow:    "0 1px 4px rgba(0,0,0,0.04)",
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={wrapStyle}>
        <SkeletonHeader columns={columns} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              display:             "grid",
              gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
              gap:                 "1rem",
              padding:             "1rem 1.5rem",
              borderBottom:        `1px solid ${T.border}`,
              alignItems:          "center",
            }}
          >
            {columns.map((col, ci) => (
              <div
                key={col.key}
                style={{
                  height:         "9px",
                  borderRadius:   "2px",
                  background:     T.surface3,
                  width:          `${48 + ((i * 11 + ci * 17) % 38)}%`,
                  animation:      "lux-pulse 1.6s ease-in-out infinite",
                  animationDelay: `${i * 60 + ci * 80}ms`,
                }}
              />
            ))}
          </div>
        ))}
        <style>{`
          @keyframes lux-pulse {
            0%, 100% { opacity: 0.35; }
            50%       { opacity: 0.75; }
          }
        `}</style>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <div style={wrapStyle}>
        <SkeletonHeader columns={columns} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 2rem", textAlign: "center" }}>
          <div style={{
            width: 42, height: 42,
            border: `1px solid ${T.goldBorder}`,
            background: T.goldDim,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1.25rem",
          }}>
            <span style={{ fontFamily: fonts.display, fontSize: "1.5rem", color: T.gold, lineHeight: 1 }}>∅</span>
          </div>
          <p style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: T.textMuted }}>
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  // ── Table ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');

        .lux-row {
          border-bottom: 1px solid ${T.border};
          transition: background 0.15s, padding-left 0.15s;
          position: relative;
        }
        .lux-row:last-child { border-bottom: none; }
        .lux-row:hover { background: ${T.surface2}; }
        .lux-row.clickable { cursor: pointer; }
        .lux-row.clickable:hover { padding-left: 0.5rem; }

        .lux-row-accent {
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 0;
          background: ${T.gold};
          transition: height 0.2s ease;
        }
        .lux-row.clickable:hover .lux-row-accent { height: 20px; }

        .lux-row-arrow {
          color: ${T.textMuted};
          transition: color 0.15s, opacity 0.15s;
          opacity: 0;
        }
        .lux-row.clickable:hover .lux-row-arrow {
          color: ${T.gold};
          opacity: 1;
        }

        .lux-row td {
          padding: 0.9rem 1.5rem;
          font-size: 0.83rem;
          color: ${T.textDim};
          vertical-align: middle;
          transition: color 0.15s;
        }
        .lux-row:hover td { color: ${T.text}; }

        @keyframes lux-pulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.75; }
        }
      `}</style>

      <div style={wrapStyle}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>

            {/* Header */}
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                {columns.map((col, i) => (
                  <th
                    key={col.key}
                    style={{
                      padding:       "0.75rem 1.5rem",
                      textAlign:     "left",
                      fontFamily:    fonts.mono,
                      fontSize:      "0.6rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color:         T.textDim,
                      fontWeight:    400,
                      whiteSpace:    "nowrap",
                      userSelect:    "none",
                      borderLeft:    i === 0 ? `2px solid ${T.gold}` : undefined,
                    }}
                    className={col.className}
                  >
                    {col.label}
                  </th>
                ))}
                <th style={{ width: "2rem" }} />
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {data.map((item, idx) => {
                const isClickable = !!onRowClick;
                return (
                  <tr
                    key={(item.id as string) || idx}
                    className={`lux-row${isClickable ? " clickable" : ""}`}
                    onClick={() => onRowClick?.(item)}
                  >
                    <span className="lux-row-accent" />
                    {columns.map((col) => (
                      <td key={col.key} className={col.className}>
                        {col.render ? col.render(item) : (item[col.key] as React.ReactNode)}
                      </td>
                    ))}
                    <td style={{ paddingRight: "1rem", textAlign: "right", width: "2rem" }}>
                      {isClickable && (
                        <ChevronRight size={13} className="lux-row-arrow" style={{ display: "inline-block" }} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentPage !== undefined &&
          totalPages !== undefined &&
          onPageChange &&
          totalPages > 1 && (
            <div style={{ borderTop: `1px solid ${T.border}`, padding: "0.75rem 1.5rem", background: T.bg }}>
              <LuxPaginationWrapper>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                />
              </LuxPaginationWrapper>
            </div>
          )}
      </div>
    </>
  );
}

// ── Skeleton header ───────────────────────────────────────────────────────────
function SkeletonHeader<T>({ columns }: { columns: Column<T>[] }) {
  return (
    <div
      style={{
        display:             "grid",
        gridTemplateColumns: `repeat(${columns.length}, 1fr) 2rem`,
        borderBottom:        `1px solid ${T.border}`,
        background:          T.bg,
        padding:             "0.75rem 1.5rem",
        gap:                 "1rem",
        alignItems:          "center",
      }}
    >
      {columns.map((col, i) => (
        <span
          key={col.key}
          style={{
            fontFamily:    fonts.mono,
            fontSize:      "0.6rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
            color:         T.textDim,
            borderLeft:    i === 0 ? `2px solid ${T.gold}` : undefined,
            paddingLeft:   i === 0 ? "0.5rem" : undefined,
          }}
        >
          {col.label}
        </span>
      ))}
      <span />
    </div>
  );
}

// ── Pagination wrapper ────────────────────────────────────────────────────────
function LuxPaginationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        fontFamily:     fonts.mono,
        fontSize:       "0.7rem",
        color:          T.textDim,
      }}
    >
      {children}
    </div>
  );
}