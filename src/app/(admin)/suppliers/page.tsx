"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import type { Supplier, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type Column } from "@/components/tables";
import { SearchInput } from "@/components/ui/search-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/hooks";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  address: z.string(),
});

type SupplierForm = z.infer<typeof supplierSchema>;

export default function SuppliersPage() {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = search !== "";

  const { data, isLoading } = useQuery<PaginatedResponse<Supplier>>({
    queryKey: ["suppliers", page, search],
    queryFn: async () => {
      const { data } = await api.get("/suppliers", { params: { page, limit: 10, search } });
      return data;
    },
  });

  const form = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
  });

  const saveMutation = useMutation({
    mutationFn: (data: SupplierForm) =>
      editingId ? api.put(`/suppliers/${editingId}`, data) : api.post("/suppliers", data),
    onSuccess: () => {
      toast({ title: editingId ? "Supplier updated" : "Supplier created", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      closeDialog();
    },
    onError: () => toast({ title: "Failed to save supplier", variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
    onSuccess: () => {
      toast({ title: "Supplier deleted", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: "", phone: "", email: "", address: "" });
    setShowDialog(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    form.reset({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || "",
      address: supplier.address || "",
    });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingId(null);
    form.reset();
  };

  const columns: Column<Supplier & Record<string, unknown>>[] = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    {
      key: "address",
      label: "Address",
      render: (item) => (
        <span className="max-w-[200px] truncate block">{item.address || "—"}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (item) => (
        <div className="flex gap-1 justify-end">
          {canEdit("suppliers") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(item as unknown as Supplier);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDelete("suppliers") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                deleteMutation.mutate(item.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="dash-root">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="header-title">Suppliers</h1>
          <p className="header-subtitle">Manage raw material suppliers</p>
        </div>
        {canCreate("suppliers") && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Supplier
          </Button>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-dot" />
            <span className="panel-title-text">Supplier List</span>
            {data?.total !== undefined && <span className="record-count">{data.total} records</span>}
          </div>
          <Button
            variant={showFilters ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            {/* <SlidersHorizontal size={11} /> */}
            Filters
            {hasActiveFilters && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />}
          </Button>
        </div>

        <div className={`filter-panel${showFilters ? " open" : ""}`}>
          <div className="filter-section">
            <SearchInput
              className="w-64"
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
            />
          </div>
        </div>

        <div className="table-container">
          <DataTable
            columns={columns}
            data={(data?.data || []) as (Supplier & Record<string, unknown>)[]}
            isLoading={isLoading}
            currentPage={page}
            totalPages={data?.totalPages || 1}
            totalItems={data?.total}
            pageSize={10}
            onPageChange={setPage}
            emptyMessage="No suppliers found."
          />
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "New"} Supplier</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...form.register("name")} error={form.formState.errors.name?.message} placeholder="Supplier name" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...form.register("phone")} error={form.formState.errors.phone?.message} placeholder="+1234567890" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...form.register("email")} error={form.formState.errors.email?.message} placeholder="email@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea {...form.register("address")} placeholder="Full address" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" isLoading={saveMutation.isPending}>
                {editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    {/* Create / Edit Dialog */}
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit" : "New"} Supplier</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...form.register("name")} error={form.formState.errors.name?.message} placeholder="Supplier name" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...form.register("phone")} error={form.formState.errors.phone?.message} placeholder="+1234567890" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...form.register("email")} error={form.formState.errors.email?.message} placeholder="email@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea {...form.register("address")} placeholder="Full address" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
  );
}
