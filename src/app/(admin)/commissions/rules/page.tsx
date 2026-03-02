"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import type { CommissionRule, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatPercent } from "@/utils/formatters";

const ruleSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0, "Must be >= 0"),
});

type RuleForm = z.infer<typeof ruleSchema>;

export default function CommissionRulesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: rules, isLoading } = useQuery<CommissionRule[]>({
    queryKey: ["commission-rules"],
    queryFn: async () => {
      const { data } = await api.get("/commission-rules");
      return data.data ?? data;
    },
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["products-all"],
    queryFn: async () => {
      const { data } = await api.get("/products", { params: { limit: 500 } });
      return data.data ?? data;
    },
  });

  const form = useForm<RuleForm>({
    resolver: zodResolver(ruleSchema),
    defaultValues: { type: "percentage", value: 0 },
  });

  const saveMutation = useMutation({
    mutationFn: (data: RuleForm) =>
      editingId ? api.put(`/commission-rules/${editingId}`, data) : api.post("/commission-rules", data),
    onSuccess: () => {
      toast({ title: editingId ? "Rule updated" : "Rule created", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["commission-rules"] });
      closeDialog();
    },
    onError: () => toast({ title: "Failed to save rule", variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/commission-rules/${id}`),
    onSuccess: () => {
      toast({ title: "Rule deleted", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["commission-rules"] });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset({ productId: "", type: "percentage", value: 0 });
    setShowDialog(true);
  };

  const openEdit = (rule: CommissionRule) => {
    setEditingId(rule.id);
    form.reset({ productId: rule.productId, type: rule.type, value: rule.value });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingId(null);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commission Rules</h1>
          <p className="text-sm text-slate-500">Configure product-level commission rules for agents</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Rule
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : rules && rules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      {(rule as unknown as { productName: string }).productName || rule.productId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.type === "percentage" ? "info" : "default"} className="capitalize">
                        {rule.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rule.type === "percentage"
                        ? formatPercent(rule.value)
                        : formatCurrency(rule.value)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(rule)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No commission rules configured.</p>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "New"} Commission Rule</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Product</Label>
              <Select {...form.register("productId")}>
                <option value="">Select product</option>
                {products?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              {form.formState.errors.productId && (
                <p className="text-xs text-red-500">{form.formState.errors.productId.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select {...form.register("type")}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("value", { valueAsNumber: true })}
                  error={form.formState.errors.value?.message}
                />
              </div>
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
