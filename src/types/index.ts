// ========================
// Factory ERP - Type Definitions
// ========================

// ---- Auth & Users ----
export type Role = "admin" | "manager" | "accountant" | "sales_agent" | "warehouse" | "production";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  timestamp: string;
}

// ---- Permissions ----
export interface Permission {
  module: string;
  actions: ("view" | "create" | "edit" | "delete")[];
}

export interface RolePermissions {
  id: string;
  name: string;
  permissions: Permission[];
}

// ---- Customers ----
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  creditLimit: number;
  creditBalance: number;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Suppliers ----
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  currentCost: number;
  minimumOrderQty: number;
  leadTimeDays: number;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
}

export type PurchaseOrderStatus = "draft" | "sent" | "confirmed" | "partial_received" | "received" | "invoiced" | "paid" | "cancelled";

export interface PurchaseOrderItem {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  minimumOrder: number;
  leadTime: number;
  receivedQty?: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  paymentTerms?: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  deliveryDate: string;
  notes?: string;
  proofOfPaymentUrl?: string;
  invoiceUrl?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Products & Inventory ----
export type ProductCategory = string;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string;
  costPrice: number;
  basePrice: number;
  minimumPrice: number;
  currentStock: number;
  minimumStock: number;
  commissionRule?: CommissionRule;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = "sale" | "production_in" | "production_out" | "adjustment" | "return";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  movementType: MovementType;
  quantity: number;
  referenceId: string;
  referenceType: string;
  notes: string;
  createdAt: string;
  createdBy: string;
}

// ---- Sales ----
export type SaleStatus = "paid" | "partial" | "unpaid";

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  agentId: string;
  agentName: string;
  items: SaleItem[];
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  paidAmount: number;
  status: SaleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  saleId: string;
  amount: number;
  method: string;
  reference: string;
  createdAt: string;
  createdBy: string;
}

// ---- Production ----
export interface BOMItem {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  quantityRequired: number;
  unit: string;
}

export interface BillOfMaterials {
  id: string;
  finishedProductId: string;
  finishedProductName: string;
  items: BOMItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionEntry {
  id: string;
  finishedProductId: string;
  finishedProductName: string;
  quantityProduced: number;
  materialsUsed: { materialId: string; materialName: string; quantity: number }[];
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  createdBy: string;
}

// ---- Commissions ----
export interface CommissionRule {
  id: string;
  productId?: string;
  category?: string;
  type: "percentage" | "fixed";
  value: number;
  createdAt: string;
}

export interface Commission {
  id: string;
  saleId: string;
  agentId: string;
  agentName: string;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

// ---- Accounting ----
export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  entries: { accountId: string; accountName: string; debit: number; credit: number }[];
  referenceId: string;
  referenceType: string;
  createdAt: string;
  createdBy: string;
  // Flat fields returned by list API
  type?: string;
  debit?: number;
  credit?: number;
  accountId?: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  balance: number;
}

// ---- API Response Types ----
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---- Dashboard ----
export interface DashboardSummary {
  totalSalesToday: number;
  totalSalesMonth: number;
  outstandingCredit: number;
  topProducts: { productName: string; quantity: number; revenue: number }[];
  lowStockAlerts: { productId: string; productName: string; currentStock: number; minimumStock: number }[];
  commissionSummary?: { total: number; paid: number; unpaid: number };
}

// ---- Filters ----
export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SalesFilter extends DateFilter, PaginationParams {
  agentId?: string;
  customerId?: string;
  status?: SaleStatus;
}

export interface InventoryFilter extends PaginationParams {
  category?: string;
  search?: string;
}

export interface StockMovementFilter extends DateFilter, PaginationParams {
  productId?: string;
  movementType?: MovementType;
}
