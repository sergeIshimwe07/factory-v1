"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Shield, ShieldOff, Key, SlidersHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import type { User, Role, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/tables";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { SearchInput } from "@/components/ui/search-input";
import { formatDate } from "@/utils/formatters";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "manager", "accountant", "sales_agent", "warehouse", "production"]),
  password: z.string().min(6, "Min 6 characters"),
});

type UserForm = z.infer<typeof userSchema>;
type UserFormInput = z.input<typeof userSchema>;

const ROLES: Role[] = ["admin", "manager", "accountant", "sales_agent", "warehouse", "production"];

export default function UsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = search !== "";

  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ["users", page, search],
    queryFn: async () => {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await api.get("/users", { params });
      return data;
    },
  });

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  const createUser = useMutation({
    mutationFn: (data: UserForm) => api.post("/users", data),
    onSuccess: () => {
      toast({ title: "User created!", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowDialog(false);
      form.reset();
    },
    onError: () => toast({ title: "Failed to create user", variant: "error" }),
  });

  const toggleActive = useMutation({
    mutationFn: (userId: string) => api.patch(`/users/${userId}/toggle-active`),
    onSuccess: () => {
      toast({ title: "User status updated", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const resetPassword = useMutation({
    mutationFn: (userId: string) => api.post(`/users/${userId}/reset-password`),
    onSuccess: () => toast({ title: "Password reset email sent", variant: "success" }),
  });

  const columns: Column<User & Record<string, unknown>>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (item) => (
        <Badge variant="info" className="capitalize">
          {(item.role as string).replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (item) => (
        <Badge variant={item.isActive ? "success" : "danger"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (item) => formatDate(item.createdAt),
    },
    {
      key: "actions",
      label: "",
      render: (item) => (
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            title={item.isActive ? "Deactivate" : "Activate"}
            onClick={(e) => {
              e.stopPropagation();
              toggleActive.mutate(item.id);
            }}
          >
            {item.isActive ? (
              <ShieldOff className="h-4 w-4 text-red-500" />
            ) : (
              <Shield className="h-4 w-4 text-green-500" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Reset password"
            onClick={(e) => {
              e.stopPropagation();
              resetPassword.mutate(item.id);
            }}
          >
            <Key className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="dash-root">
        {/* header */}
        <div className="page-header">
          <div>
            <h1 className="header-title">Users</h1>
            <p className="header-subtitle">Manage system users and their roles</p>
          </div>
          <Button onClick={() => { form.reset(); setShowDialog(true); }}>
            <Plus className="h-4 w-4" />
            New User
          </Button>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <span className="panel-title-dot" />
              <span className="panel-title-text">User List</span>
              {data?.total !== undefined && (
                <span className="record-count">{data.total} records</span>
              )}
            </div>
            <Button
              variant={showFilters ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal size={11} />
              Filters
              {hasActiveFilters && (
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--gold)",
                    display: "inline-block",
                  }}
                />
              )}
            </Button>
          </div>

          <div className={`filter-panel${showFilters ? " open" : ""}`}>
            <div className="filter-section">
              <SearchInput
                className="w-64"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch("")}
              />
            </div>
          </div>

          <div className="table-container">
            <DataTable
              columns={columns}
              data={(data?.data || []) as (User & Record<string, unknown>)[]}
              isLoading={isLoading}
              currentPage={page}
              totalPages={data?.totalPages || 1}
              totalItems={data?.total}
              pageSize={10}
              onPageChange={setPage}
              emptyMessage="No users found."
            />
          </div>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((data) => createUser.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                {...form.register("name")}
                error={form.formState.errors.name?.message}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                {...form.register("email")}
                error={form.formState.errors.email?.message}
                placeholder="user@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select {...form.register("role")}>
                <option value="">Select role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </Select>
              {form.formState.errors.role && (
                <p className="text-xs text-red-500">{form.formState.errors.role.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                {...form.register("password")}
                error={form.formState.errors.password?.message}
                placeholder="Minimum 6 characters"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createUser.isPending}>
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}