"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Printer, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatNumber, downloadBlob } from "@/utils/formatters";

interface InventoryReportRow {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unitCost: number;
  stockValue: number;
  isLowStock: boolean;
}

interface InventoryReportSummary {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  rows: InventoryReportRow[];
}

export default function InventoryReportPage() {
  const [category, setCategory] = useState("");

  const { data, isLoading } = useQuery<InventoryReportSummary>({
    queryKey: ["report-inventory", category],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (category) params.category = category;
      const { data } = await api.get("/reports/inventory", { params });
      return data.data ?? data;
    },
  });

  const handleExportCSV = async () => {
    const { data: blob } = await api.get("/reports/inventory/export", {
      params: { category, format: "csv" },
      responseType: "blob",
    });
    downloadBlob(blob, `inventory-report.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Report</h1>
          <p className="text-sm text-slate-500">Stock levels & valuation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-1 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Total Products</p>
              <p className="mt-1 text-2xl font-bold">{data.totalProducts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Total Stock Value</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">{formatCurrency(data.totalValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Low Stock Items</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{data.lowStockCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : data ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Min Stock</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Stock Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row) => (
                  <TableRow key={row.productId} className={row.isLowStock ? "bg-red-50" : ""}>
                    <TableCell className="font-medium">{row.productName}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.currentStock)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.minimumStock)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.unitCost)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.stockValue)}</TableCell>
                    <TableCell>
                      {row.isLowStock ? (
                        <Badge variant="danger" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Low
                        </Badge>
                      ) : (
                        <Badge variant="success">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
