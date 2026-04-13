"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Upload, Download, Send, CheckCircle, Clock, AlertTriangle, Trash2 } from "lucide-react";
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
} as const;

const fonts = {
  display: "'Cormorant Garamond', serif",
  mono:    "'DM Mono', monospace",
  body:    "'Outfit', sans-serif",
};

type OrderStatus = "draft" | "sent" | "confirmed" | "partial_received" | "received" | "invoiced" | "paid" | "cancelled";

const statusConfig: Record<OrderStatus, { color: string; bg: string; border: string; label: string }> = {
  draft: { color: T.textMuted, bg: T.surface3, border: T.border, label: "Draft" },
  sent: { color: T.blue, bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.2)", label: "Sent" },
  confirmed: { color: "#EA580C", bg: "rgba(234,88,12,0.08)", border: "rgba(234,88,12,0.2)", label: "Confirmed" },
  partial_received: { color: T.amber, bg: T.amberDim, border: T.amberBorder, label: "Partial Received" },
  received: { color: T.green, bg: T.greenDim, border: T.greenBorder, label: "Received" },
  invoiced: { color: "#6366F1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", label: "Invoiced" },
  paid: { color: T.green, bg: T.greenDim, border: T.greenBorder, label: "Paid" },
  cancelled: { color: T.red, bg: T.redDim, border: T.redBorder, label: "Cancelled" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "0.4rem",
      padding: "0.5rem 1rem", borderRadius: "0.35rem",
      background: config.bg, border: `1px solid ${config.border}`, color: config.color,
      fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
    }}>
      {config.label}
    </div>
  );
}

function SectionCard({ children, title, dot = T.gold, action }: { children: React.ReactNode; title: string; dot?: string; action?: React.ReactNode }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block" }} />
          <span style={{ fontFamily: fonts.display, fontSize: "1.15rem", fontWeight: 500, color: T.text }}>
            {title}
          </span>
        </div>
        {action}
      </div>
      <div style={{ padding: "1.5rem" }}>
        {children}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const invoiceFileRef = useRef<HTMLInputElement>(null);

  const orderId = params.id as string;
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReceivingModal, setShowReceivingModal] = useState(false);
  const [receivingData, setReceivingData] = useState<Record<string, number>>({});
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ["supplier-order", orderId],
    queryFn: async () => {
      const { data } = await api.get(`/supplier-orders/${orderId}`);
      return data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) => 
      api.patch(`/supplier-orders/${orderId}`, { status }),
    onSuccess: () => {
      toast({ title: "Status updated", variant: "success" });
      setShowStatusModal(false);
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "error" });
    },
  });

  const uploadProofMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post(`/supplier-orders/${orderId}/proof-of-payment`, formData);
    },
    onSuccess: () => {
      toast({ title: "Proof of payment uploaded", variant: "success" });
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to upload proof", variant: "error" });
    },
  });

  const uploadInvoiceMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post(`/supplier-orders/${orderId}/invoice`, formData);
    },
    onSuccess: () => {
      toast({ title: "Invoice uploaded", variant: "success" });
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to upload invoice", variant: "error" });
    },
  });

  const recordReceivingMutation = useMutation({
    mutationFn: (receiving: Record<string, number>) => 
      api.post(`/supplier-orders/${orderId}/receiving`, { items: receiving }),
    onSuccess: () => {
      toast({ title: "Receiving recorded", variant: "success" });
      setShowReceivingModal(false);
      setReceivingData({});
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to record receiving", variant: "error" });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: () => api.post(`/supplier-orders/${orderId}/send-email`),
    onSuccess: () => {
      toast({ title: "Order sent to supplier", variant: "success" });
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to send email", variant: "error" });
    },
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: T.textMuted }}>Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: T.textMuted }}>Order not found</p>
      </div>
    );
  }

  const total = order.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: fonts.body, color: T.text, padding: "2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
            <button
              onClick={() => router.back()}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                background: "transparent", border: "none", cursor: "pointer",
                fontFamily: fonts.mono, fontSize: "0.7rem", letterSpacing: "0.1em",
                textTransform: "uppercase", color: T.textDim,
              }}
            >
              <ArrowLeft size={14} /> Back
            </button>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              {order.status === "draft" && (
                <button
                  onClick={() => sendEmailMutation.mutate()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.6rem 1.25rem", background: T.blue, color: T.surface,
                    border: "none", cursor: "pointer", fontFamily: fonts.mono, fontSize: "0.65rem",
                    letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
                  }}
                >
                  <Send size={13} /> Send to Supplier
                </button>
              )}
              {["sent", "confirmed", "partial_received"].includes(order.status) && (
                <button
                  onClick={() => setShowReceivingModal(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.6rem 1.25rem", background: T.goldDim, color: T.gold,
                    border: `1px solid ${T.goldBorder}`, cursor: "pointer", fontFamily: fonts.mono, fontSize: "0.65rem",
                    letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
                  }}
                >
                  <CheckCircle size={13} /> Record Receiving
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem" }}>
            {/* ── Main Content ── */}
            <div>

              {/* Supplier Info */}
              <SectionCard title="Supplier Information" dot={T.gold}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <p style={{ fontFamily: fonts.mono, fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.4rem" }}>
                      Supplier
                    </p>
                    <p style={{ fontSize: "1rem", fontWeight: 500, color: T.text }}>{order.supplierName}</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: fonts.mono, fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.4rem" }}>
                      Payment Terms
                    </p>
                    <p style={{ fontSize: "1rem", fontWeight: 500, color: T.text }}>{order.paymentTerms || "Net 30"}</p>
                  </div>
                </div>
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <p style={{ fontFamily: fonts.mono, fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.4rem" }}>
                      Email
                    </p>
                    <p style={{ fontSize: "0.85rem", color: T.textDim }}>{order.supplierEmail}</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: fonts.mono, fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.4rem" }}>
                      Phone
                    </p>
                    <p style={{ fontSize: "0.85rem", color: T.textDim }}>{order.supplierPhone}</p>
                  </div>
                </div>
              </SectionCard>

              {/* Order Details */}
              <SectionCard title="Order Details" dot="#2D7FC2">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                  {[
                    { label: "Order Date", value: new Date(order.createdAt).toLocaleDateString() },
                    { label: "Expected Delivery", value: new Date(order.deliveryDate).toLocaleDateString() },
                    { label: "Items", value: order.items.length.toString() },
                  ].map((item, i) => (
                    <div key={i}>
                      <p style={{ fontFamily: fonts.mono, fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.4rem" }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: "1rem", fontWeight: 500, color: T.text }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {order.notes && (
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${T.border}` }}>
                    <p style={{ fontFamily: fonts.mono, fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: "0.4rem" }}>
                      Notes
                    </p>
                    <p style={{ fontSize: "0.85rem", color: T.textDim, whiteSpace: "pre-wrap" }}>{order.notes}</p>
                  </div>
                )}
              </SectionCard>

              {/* Materials */}
              <SectionCard title="Materials Ordered" dot="#2D7FC2">
                <div style={{ background: T.surface3, borderBottom: `1px solid ${T.border}` }}>
                  <div style={{
                    display: "grid", gridTemplateColumns: "2fr 100px 100px 100px 100px",
                    gap: "1rem", padding: "0.75rem 1rem", fontFamily: fonts.mono, fontSize: "0.65rem",
                    letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, fontWeight: 500,
                  }}>
                    {["Material", "Qty", "Unit Price", "Total", "Received"].map((h, i) => (
                      <span key={i}>{h}</span>
                    ))}
                  </div>
                </div>
                {order.items.map((item: any, i: number) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  return (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "2fr 100px 100px 100px 100px",
                      gap: "1rem", padding: "1rem", borderBottom: `1px solid ${T.border}`,
                      alignItems: "center",
                    }}>
                      <div>
                        <p style={{ fontSize: "0.85rem", fontWeight: 500, color: T.text }}>{item.rawMaterialName}</p>
                        <p style={{ fontFamily: fonts.mono, fontSize: "0.62rem", color: T.textMuted, marginTop: "0.2rem" }}>
                          {item.unit}
                        </p>
                      </div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 500, color: T.text }}>
                        {formatNumber(item.quantity)}
                      </p>
                      <p style={{ fontSize: "0.85rem", color: T.textDim }}>
                        {formatCurrency(item.unitPrice)}
                      </p>
                      <p style={{ fontSize: "0.9rem", fontWeight: 600, color: T.gold }}>
                        {formatCurrency(lineTotal)}
                      </p>
                      <p style={{ fontSize: "0.85rem", fontWeight: 500, color: T.green }}>
                        {formatNumber(item.receivedQty || 0)}
                      </p>
                    </div>
                  );
                })}
                <div style={{ padding: "1rem 1rem", background: T.surface2, borderTop: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted }}>
                      Order Total
                    </span>
                    <span style={{ fontFamily: fonts.display, fontSize: "1.4rem", fontWeight: 600, color: T.gold }}>
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </SectionCard>

            </div>

            {/* ── Sidebar ── */}
            <div>

              {/* Status */}
              <SectionCard title="Status" dot={T.goldBorder}>
                <StatusBadge status={order.status as OrderStatus} />
                <button
                  onClick={() => setShowStatusModal(true)}
                  style={{
                    width: "100%", marginTop: "1rem", padding: "0.6rem", fontFamily: fonts.mono,
                    fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase",
                    background: T.surface2, border: `1px solid ${T.border}`, cursor: "pointer", color: T.textDim,
                  }}
                >
                  Update Status
                </button>
              </SectionCard>

              {/* Proof of Payment */}
              <SectionCard title="Payment" dot={T.amber}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {order.proofOfPaymentUrl ? (
                    <>
                      <div style={{
                        padding: "0.75rem", background: T.greenDim, border: `1px solid ${T.greenBorder}`,
                        display: "flex", alignItems: "center", gap: "0.5rem", color: T.green, fontSize: "0.75rem",
                      }}>
                        <CheckCircle size={13} />
                        <span>Payment proof uploaded</span>
                      </div>
                      <button
                        onClick={() => window.open(order.proofOfPaymentUrl)}
                        style={{
                          padding: "0.6rem", background: T.surface2, border: `1px solid ${T.border}`,
                          cursor: "pointer", fontFamily: fonts.mono, fontSize: "0.65rem",
                          letterSpacing: "0.1em", textTransform: "uppercase", color: T.textDim,
                        }}
                      >
                        <Download size={12} style={{ marginRight: "0.4rem" }} /> View
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: "0.6rem", background: T.surface2, border: `1px solid ${T.border}`,
                        cursor: "pointer", fontFamily: fonts.mono, fontSize: "0.65rem",
                        letterSpacing: "0.1em", textTransform: "uppercase", color: T.textDim,
                      }}
                    >
                      <Upload size={12} style={{ marginRight: "0.4rem" }} /> Upload Proof
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) uploadProofMutation.mutate(e.target.files[0]);
                    }}
                  />
                </div>
              </SectionCard>

              {/* Invoice */}
              <SectionCard title="Invoice" dot={T.blue}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {order.invoiceUrl ? (
                    <>
                      <div style={{
                        padding: "0.75rem", background: T.greenDim, border: `1px solid ${T.greenBorder}`,
                        display: "flex", alignItems: "center", gap: "0.5rem", color: T.green, fontSize: "0.75rem",
                      }}>
                        <CheckCircle size={13} />
                        <span>Invoice uploaded</span>
                      </div>
                      <button
                        onClick={() => window.open(order.invoiceUrl)}
                        style={{
                          padding: "0.6rem", background: T.surface2, border: `1px solid ${T.border}`,
                          cursor: "pointer", fontFamily: fonts.mono, fontSize: "0.65rem",
                          letterSpacing: "0.1em", textTransform: "uppercase", color: T.textDim,
                        }}
                      >
                        <Download size={12} style={{ marginRight: "0.4rem" }} /> View
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => invoiceFileRef.current?.click()}
                      style={{
                        padding: "0.6rem", background: T.surface2, border: `1px solid ${T.border}`,
                        cursor: "pointer", fontFamily: fonts.mono, fontSize: "0.65rem",
                        letterSpacing: "0.1em", textTransform: "uppercase", color: T.textDim,
                      }}
                    >
                      <Upload size={12} style={{ marginRight: "0.4rem" }} /> Upload Invoice
                    </button>
                  )}
                  <input
                    ref={invoiceFileRef}
                    type="file"
                    hidden
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) uploadInvoiceMutation.mutate(e.target.files[0]);
                    }}
                  />
                </div>
              </SectionCard>

            </div>

          </div>
        </div>
      </div>

      {/* ── Status Modal ── */}
      {showStatusModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: "0.5rem",
            padding: "2rem", maxWidth: 400, width: "90%",
          }}>
            <p style={{ fontFamily: fonts.display, fontSize: "1.3rem", fontWeight: 500, marginBottom: "1rem", color: T.text }}>
              Update Status
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {["sent", "confirmed", "partial_received", "received", "invoiced", "paid"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setNewStatus(s as OrderStatus);
                    updateStatusMutation.mutate(s as OrderStatus);
                  }}
                  style={{
                    padding: "0.75rem 1rem", border: `1px solid ${T.border}`, background: T.surface2,
                    cursor: "pointer", textAlign: "left", fontSize: "0.82rem", color: T.text,
                    fontFamily: fonts.body,
                  }}
                >
                  {statusConfig[s as OrderStatus].label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowStatusModal(false)}
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
      )}

      {/* ── Receiving Modal ── */}
      {showReceivingModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          overflow: "auto",
        }}>
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: "0.5rem",
            padding: "2rem", maxWidth: 500, width: "90%", margin: "2rem auto",
          }}>
            <p style={{ fontFamily: fonts.display, fontSize: "1.3rem", fontWeight: 500, marginBottom: "1.5rem", color: T.text }}>
              Record Receiving
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
              {order.items.map((item: any) => (
                <div key={item.id}>
                  <label style={{ fontFamily: fonts.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, display: "block", marginBottom: "0.4rem" }}>
                    {item.rawMaterialName}
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="number"
                      min={0}
                      max={item.quantity}
                      value={receivingData[item.id] || 0}
                      onChange={(e) => setReceivingData({ ...receivingData, [item.id]: parseInt(e.target.value) || 0 })}
                      style={{
                        flex: 1, padding: "0.6rem 0.75rem", border: `1px solid ${T.border}`,
                        fontFamily: fonts.mono, fontSize: "0.75rem", background: T.surface2,
                      }}
                    />
                    <span style={{ fontFamily: fonts.mono, fontSize: "0.7rem", color: T.textMuted, minWidth: 40 }}>
                      / {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => { recordReceivingMutation.mutate(receivingData); }}
                style={{
                  flex: 1, padding: "0.6rem", background: T.goldDim, border: `1px solid ${T.goldBorder}`,
                  color: T.gold, cursor: "pointer", fontFamily: fonts.mono, fontSize: "0.65rem",
                  letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
                }}
              >
                Record
              </button>
              <button
                onClick={() => setShowReceivingModal(false)}
                style={{
                  flex: 1, padding: "0.6rem", border: `1px solid ${T.border}`,
                  background: "transparent", cursor: "pointer", fontSize: "0.75rem",
                  fontFamily: fonts.mono, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textDim,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
