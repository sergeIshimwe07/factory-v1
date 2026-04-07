"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronRight, AlertTriangle, Upload, Download, Eye, Send, CheckCircle, Clock, DollarSign } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatNumber } from "@/utils/formatters";

const T = {
  gold:        "#B5611F",
  goldLight:   "#C2622D",
  goldDim:     "rgba(181,97,31,0.08)",
  goldBorder:  "rgba(181,97,31,0.20)",
  bg:          "#F5F2EE",
  surface:     "#FFFFFF",
  surface2:    "#F9F7F4",
  surface3:    "#F0EDE8",
  border:      "rgba(0,0,0,0.07)",
  text:        "#1C1917",
  textDim:     "#78716C",
  textMuted:   "#A8A29E",
  red:         "#DC2626",
  redDim:      "rgba(220,38,38,0.08)",
  redBorder:   "rgba(220,38,38,0.20)",
  amber:       "#B45309",
  amberDim:    "rgba(180,83,9,0.08)",
  amberBorder: "rgba(180,83,9,0.20)",
  green:       "#059669",
  greenDim:    "rgba(5,150,105,0.08)",
  greenBorder: "rgba(5,150,105,0.20)",
  blue:        "#2563EB",
  blueDim:     "rgba(37,99,235,0.08)",
  blueBorder:  "rgba(37,99,235,0.20)",
} as const;

const fonts = {
  display: "'Cormorant Garamond', serif",
  mono:    "'DM Mono', monospace",
  body:    "'Outfit', sans-serif",
};

type OrderStatus = "draft" | "sent" | "confirmed" | "partial_received" | "received" | "invoiced" | "paid" | "cancelled";

const statusConfig: Record<OrderStatus, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  draft: { color: T.textMuted, bg: T.surface3, border: T.border, icon: <Clock size={12} />, label: "Draft" },
  sent: { color: T.blue, bg: T.blueDim, border: T.blueBorder, icon: <Send size={12} />, label: "Sent" },
  confirmed: { color: "#EA580C", bg: "rgba(234,88,12,0.08)", border: "rgba(234,88,12,0.2)", icon: <CheckCircle size={12} />, label: "Confirmed" },
  partial_received: { color: T.amber, bg: T.amberDim, border: T.amberBorder, icon: <AlertTriangle size={12} />, label: "Partial" },
  received: { color: T.green, bg: T.greenDim, border: T.greenBorder, icon: <CheckCircle size={12} />, label: "Received" },
  invoiced: { color: "#6366F1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", icon: <DollarSign size={12} />, label: "Invoiced" },
  paid: { color: T.green, bg: T.greenDim, border: T.greenBorder, icon: <CheckCircle size={12} />, label: "Paid" },
  cancelled: { color: T.red, bg: T.redDim, border: T.redBorder, icon: <AlertTriangle size={12} />, label: "Cancelled" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "0.4rem",
      padding: "0.4rem 0.75rem", borderRadius: "0.25rem",
      background: config.bg, border: `1px solid ${config.border}`, color: config.color,
      fontFamily: fonts.mono, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
    }}>
      {config.icon}
      {config.label}
    </div>
  );
}

function UpdateStatusModal({ isOpen, order, onClose, onStatusChange }: { isOpen: boolean; order: any; onClose: () => void; onStatusChange: (status: OrderStatus) => void }) {
  if (!isOpen) return null;

  const availableTransitions: OrderStatus[] = {
    draft: ["sent", "cancelled"],
    sent: ["confirmed", "cancelled"],
    confirmed: ["partial_received", "cancelled"],
    partial_received: ["received", "cancelled"],
    received: ["invoiced", "cancelled"],
    invoiced: ["paid", "cancelled"],
    paid: [],
    cancelled: [],
  }[order?.status || "draft"] || [];

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: "0.5rem", padding: "2rem", maxWidth: 400, width: "90%",
      }}>
        <p style={{ fontFamily: fonts.display, fontSize: "1.3rem", fontWeight: 500, marginBottom: "1rem", color: T.text }}>
          Update Order Status
        </p>
        <p style={{ fontSize: "0.85rem", color: T.textDim, marginBottom: "1.5rem" }}>
          Current: <StatusBadge status={order?.status} />
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {availableTransitions.map((status) => (
            <button
              key={status}
              onClick={() => { onStatusChange(status); onClose(); }}
              style={{
                padding: "0.75rem 1rem", border: `1px solid ${T.border}`, background: T.surface2,
                cursor: "pointer", textAlign: "left", fontSize: "0.82rem", color: T.text,
                transition: "all 0.2s", fontFamily: fonts.body,
              }}
              onMouseEnter={(e) => { e.currentTarget.background = T.surface3; }}
              onMouseLeave={(e) => { e.currentTarget.background = T.surface2; }}
            >
              <StatusBadge status={status} />
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "0.6rem", border: `1px solid ${T.border}`,
            background: "transparent", cursor: "pointer", fontSize: "0.75rem",
            fontFamily: fonts.mono, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textDim,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function OrderRow({ order, onStatusUpdate, onUploadProof, router }: any) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const total = order.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

  const updateMutation = useMutation({
    mutationFn: (status: OrderStatus) => api.patch(`/supplier-orders/${order.id}`, { status }),
    onSuccess: () => {
      setShowStatusModal(false);
      onStatusUpdate();
    },
  });

  return (
    <>
      <div style={{
        display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 0.5fr",
        gap: "1rem", padding: "1rem 1.5rem", borderBottom: `1px solid ${T.border}`,
        alignItems: "center", cursor: "pointer",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = T.surface2}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
      >
        <div>
          <p style={{ fontSize: "0.9rem", fontWeight: 500, color: T.text }}>{order.supplierName}</p>
          <p style={{ fontFamily: fonts.mono, fontSize: "0.65rem", color: T.textMuted, marginTop: "0.2rem" }}>
            PO #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div>
          <p style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.3rem" }}>
            Items
          </p>
          <p style={{ fontSize: "0.85rem", fontWeight: 500, color: T.text }}>
            {order.items.length}
          </p>
        </div>

        <div>
          <p style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.3rem" }}>
            Total
          </p>
          <p style={{ fontSize: "0.95rem", fontWeight: 600, color: T.gold }}>
            {formatCurrency(total)}
          </p>
        </div>

        <div>
          <p style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.3rem" }}>
            Delivery
          </p>
          <p style={{ fontSize: "0.82rem", color: T.textDim }}>
            {new Date(order.deliveryDate).toLocaleDateString()}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <StatusBadge status={order.status} />
        </div>

        <button
          onClick={() => router.push(`/suppliers/orders/${order.id}`)}
          style={{
            background: "transparent", border: "none", cursor: "pointer", padding: "0.4rem",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <ChevronRight size={16} color={T.textMuted} />
        </button>
      </div>

      <UpdateStatusModal
        isOpen={showStatusModal}
        order={order}
        onClose={() => setShowStatusModal(false)}
        onStatusChange={(status) => updateMutation.mutate(status)}
      />
    </>
  );
}

export default function SupplierOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["supplier-orders"],
    queryFn: async () => {
      const { data } = await api.get("/supplier-orders");
      return data.data || [];
    },
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: fonts.body, color: T.text, padding: "2rem 2rem 4rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
            <div>
              <p style={{ fontFamily: fonts.mono, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, marginBottom: "0.5rem" }}>
                Procurement
              </p>
              <h1 style={{ fontFamily: fonts.display, fontSize: "2.75rem", fontWeight: 600, color: T.text }}>
                Purchase Orders
              </h1>
            </div>
            <button
              onClick={() => router.push("/suppliers/orders/new")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.65rem 1.5rem", background: T.goldDim, border: `1px solid ${T.goldBorder}`,
                color: T.gold, fontFamily: fonts.mono, fontSize: "0.7rem", letterSpacing: "0.1em",
                textTransform: "uppercase", cursor: "pointer", fontWeight: 500, transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(181,97,31,0.18)"; e.currentTarget.style.borderColor = T.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = T.goldDim; e.currentTarget.style.borderColor = T.goldBorder; }}
            >
              <Plus size={14} /> New Order
            </button>
          </div>

          {/* ── Orders List ── */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            {/* Header Row */}
            <div style={{
              display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 0.5fr",
              gap: "1rem", padding: "1rem 1.5rem", borderBottom: `1px solid ${T.border}`, background: T.surface3,
            }}>
              {["Supplier", "Items", "Total", "Delivery", "Status", ""].map((h, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: fonts.mono, fontSize: "0.62rem", letterSpacing: "0.15em",
                    textTransform: "uppercase", color: T.textMuted, fontWeight: 500,
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {isLoading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: T.textMuted }}>Loading...</div>
            ) : orders && orders.length > 0 ? (
              orders.map((order: any) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  router={router}
                  onStatusUpdate={() => refetch()}
                  onUploadProof={() => {}}
                />
              ))
            ) : (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <p style={{ fontFamily: fonts.mono, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted }}>
                  No purchase orders yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
