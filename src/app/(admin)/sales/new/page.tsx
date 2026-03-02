"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, AlertTriangle, Search } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import type { Product, Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/utils/formatters";

const saleItemSchema = z.object({
  productId: z.string().min(1, "Product required"),
  productName: z.string(),
  quantity: z.number().min(1, "Min 1"),
  unit: z.string(),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).default(0),
  availableStock: z.number(),
  minimumPrice: z.number(),
});

const saleSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  customerName: z.string(),
  items: z.array(saleItemSchema).min(1, "Add at least one product"),
});

type SaleFormData = z.infer<typeof saleSchema>;
type SaleFormInput = z.input<typeof saleSchema>;

export default function CreateSalePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SaleFormInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: { items: [], customerId: "", customerName: "" },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchItems = watch("items");

  // Fetch customers
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["customers-search", customerSearch],
    queryFn: async () => {
      const { data } = await api.get("/customers", { params: { search: customerSearch, limit: 10 } });
      return data.data || data;
    },
    enabled: customerSearch.length > 1,
  });

  // Fetch products
  const { data: products } = useQuery<Product[]>({
    queryKey: ["products-search", productSearch],
    queryFn: async () => {
      const { data } = await api.get("/products", { params: { search: productSearch, limit: 10 } });
      return data.data || data;
    },
    enabled: productSearch.length > 1,
  });

  // Submit mutation
  const mutation = useMutation({
    mutationFn: async (data: SaleFormData) => {
      const payload = {
        customerId: data.customerId,
        agentId: user?.id,
        items: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discount: item.discount,
        })),
      };
      return api.post("/sales", payload);
    },
    onSuccess: () => {
      toast({ title: "Sale created successfully!", variant: "success" });
      router.push("/sales");
    },
    onError: () => {
      toast({ title: "Failed to create sale", variant: "error" });
    },
  });

  const selectCustomer = useCallback(
    (customer: Customer) => {
      setSelectedCustomer(customer);
      setValue("customerId", customer.id);
      setValue("customerName", customer.name);
      setCustomerSearch(customer.name);
      setShowCustomerDropdown(false);
    },
    [setValue]
  );

  const addProduct = useCallback(
    (product: Product) => {
      const exists = watchItems.some((item) => item.productId === product.id);
      if (exists) {
        toast({ title: "Product already added", variant: "warning" });
        return;
      }
      append({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unit: product.unit,
        unitPrice: product.basePrice,
        discount: 0,
        availableStock: product.currentStock,
        minimumPrice: product.minimumPrice,
      });
      setProductSearch("");
      setShowProductDropdown(false);
    },
    [append, watchItems, toast]
  );

  // Calculations
  const subtotal = watchItems.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice - (item.discount ?? 0);
  }, 0);

  const totalDiscount = watchItems.reduce((sum, item) => sum + (item.discount ?? 0), 0);

  // Validation checks
  const hasStockIssue = watchItems.some((item) => item.quantity > item.availableStock);
  const hasCreditIssue =
    selectedCustomer && subtotal > selectedCustomer.creditLimit - selectedCustomer.creditBalance;
  const canSave = !hasStockIssue && !hasCreditIssue && watchItems.length > 0;

  const onSubmit = (data: SaleFormInput) => {
    if (!canSave) return;
    mutation.mutate(data as SaleFormData);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create New Sale</h1>
        <p className="text-sm text-slate-500">
          Agent: {user?.name || "Unknown"} &bull; Auto-assigned
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Label>Search Customer</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  placeholder="Search by name or phone..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                />
              </div>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
              )}

              {showCustomerDropdown && customers && customers.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                  {customers.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-slate-50"
                      onClick={() => selectCustomer(c)}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-slate-400">
                        Credit: {formatCurrency(c.creditLimit - c.creditBalance)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="mt-3 rounded-md border border-slate-100 bg-slate-50 p-3 text-sm">
                <p>
                  <span className="font-medium">Customer:</span> {selectedCustomer.name}
                </p>
                <p>
                  <span className="font-medium">Credit Limit:</span>{" "}
                  {formatCurrency(selectedCustomer.creditLimit)}
                </p>
                <p>
                  <span className="font-medium">Available Credit:</span>{" "}
                  {formatCurrency(selectedCustomer.creditLimit - selectedCustomer.creditBalance)}
                </p>
                {selectedCustomer.isBlocked && (
                  <p className="mt-1 font-medium text-red-600">
                    <AlertTriangle className="mr-1 inline h-4 w-4" />
                    Customer is blocked
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Products</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  placeholder="Search product..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                />
                {showProductDropdown && products && products.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                    {products.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-slate-50"
                        onClick={() => addProduct(p)}
                      >
                        <span>{p.name}</span>
                        <span className="text-xs text-slate-400">
                          Stock: {p.currentStock} &bull; {formatCurrency(p.basePrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {errors.items && (
              <p className="text-sm text-red-600">{errors.items.message}</p>
            )}
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                <Plus className="mx-auto mb-2 h-8 w-8" />
                Search and add products above
              </div>
            ) : (
              <div className="space-y-3">
                {/* Header */}
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-xs font-medium text-slate-500 px-1">
                  <div className="col-span-3">Product</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-1">Unit</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Discount</div>
                  <div className="col-span-1">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {fields.map((field, index) => {
                  const item = watchItems[index];
                  const lineTotal = item ? item.quantity * item.unitPrice - (item.discount ?? 0) : 0;
                  const stockWarning = item && item.quantity > item.availableStock;
                  const priceWarning = item && item.unitPrice < item.minimumPrice;

                  return (
                    <div
                      key={field.id}
                      className={`grid grid-cols-1 sm:grid-cols-12 gap-2 rounded-md border p-3 ${
                        stockWarning ? "border-red-200 bg-red-50" : "border-slate-100"
                      }`}
                    >
                      <div className="sm:col-span-3">
                        <p className="font-medium text-sm">{field.productName}</p>
                        <p className="text-xs text-slate-400">Stock: {field.availableStock}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          type="number"
                          min={1}
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        />
                        {stockWarning && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Exceeds stock
                          </p>
                        )}
                      </div>
                      <div className="sm:col-span-1">
                        <Input {...register(`items.${index}.unit`)} readOnly className="bg-slate-50" />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                        />
                        {priceWarning && (
                          <p className="mt-1 text-xs text-yellow-600">Below min price</p>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.discount`, { valueAsNumber: true })}
                        />
                      </div>
                      <div className="sm:col-span-1 flex items-center">
                        <span className="font-medium text-sm">{formatCurrency(lineTotal)}</span>
                      </div>
                      <div className="sm:col-span-1 flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-end space-y-2 border-t pt-4">
            <div className="flex justify-between w-full max-w-xs text-sm">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal + totalDiscount)}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs text-sm">
              <span className="text-slate-500">Discount:</span>
              <span className="font-medium text-red-600">-{formatCurrency(totalDiscount)}</span>
            </div>
            <div className="flex justify-between w-full max-w-xs text-lg border-t pt-2">
              <span className="font-bold">Total:</span>
              <span className="font-bold">{formatCurrency(subtotal)}</span>
            </div>
          </CardFooter>
        </Card>

        {/* Warnings */}
        {hasCreditIssue && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Credit limit exceeded</p>
              <p>
                This sale ({formatCurrency(subtotal)}) exceeds the customer&apos;s available credit (
                {formatCurrency(
                  (selectedCustomer?.creditLimit || 0) - (selectedCustomer?.creditBalance || 0)
                )}
                ).
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSave} isLoading={mutation.isPending}>
            Create Sale
          </Button>
        </div>
      </form>
    </div>
  );
}
