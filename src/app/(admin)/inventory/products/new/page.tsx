"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  costPrice: z.number().min(0, "Must be >= 0"),
  basePrice: z.number().min(0, "Must be >= 0"),
  minimumPrice: z.number().min(0, "Must be >= 0"),
  minimumStock: z.number().min(0, "Must be >= 0"),
  commissionType: z.string().optional(),
  commissionValue: z.number().min(0).optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      costPrice: 0,
      basePrice: 0,
      minimumPrice: 0,
      minimumStock: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProductForm) => api.post("/products", data),
    onSuccess: () => {
      toast({ title: "Product created successfully!", variant: "success" });
      router.push("/inventory/products");
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "error" });
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Product</h1>
        <p className="text-sm text-slate-500">Add a new product to your inventory</p>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input {...register("name")} error={errors.name?.message} placeholder="Enter product name" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input {...register("category")} error={errors.category?.message} placeholder="e.g. Raw Material" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input {...register("unit")} error={errors.unit?.message} placeholder="e.g. kg, pcs, liter" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("costPrice", { valueAsNumber: true })}
                  error={errors.costPrice?.message}
                />
              </div>
              <div className="space-y-2">
                <Label>Base Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("basePrice", { valueAsNumber: true })}
                  error={errors.basePrice?.message}
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("minimumPrice", { valueAsNumber: true })}
                  error={errors.minimumPrice?.message}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Stock Level</Label>
              <Input
                type="number"
                {...register("minimumStock", { valueAsNumber: true })}
                error={errors.minimumStock?.message}
                placeholder="Alert when stock falls below this"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commission Rule (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  {...register("commissionType")}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">No commission</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("commissionValue", { valueAsNumber: true })}
                  placeholder="Commission value"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
