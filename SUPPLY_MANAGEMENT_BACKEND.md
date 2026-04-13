# Supply Management Backend Implementation Guide

## Overview

The Supply Management system handles supplier relationships, purchase order creation, and order tracking. It consists of three main modules:

1. **Suppliers Management** - Master data for suppliers
2. **Raw Materials** - Products/materials available from suppliers
3. **Supplier Orders (Purchase Orders)** - Create and track purchase orders from suppliers

---

## Base URL
```
http://localhost:8081/api
```

---

## 1. SUPPLIERS ENDPOINT

### 1.1 Get All Suppliers
**GET** `/suppliers`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Records per page (default: 10) |
| search | string | No | Search by name, email, or phone |

**Frontend Implementation:**
- Location: `src/app/(admin)/supply/suppliers/page.tsx`
- Shows paginated list of suppliers in a data table
- Supports search/filter functionality
- Allows Create, Edit, Delete operations

**Request Example:**
```bash
curl -X GET "http://localhost:8081/api/suppliers?page=1&limit=10&search=ABC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "data": [
      {
        "id": "sup_001",
        "name": "ABC Suppliers Ltd",
        "email": "contact@abcsuppliers.com",
        "phone": "+1-234-567-8900",
        "address": "123 Industrial Ave, City",
        "paymentTerms": "Net 30",
        "isActive": true,
        "createdAt": "2025-01-15T10:30:00Z",
        "updatedAt": "2025-01-15T10:30:00Z"
      },
      {
        "id": "sup_002",
        "name": "Premium Materials Co",
        "email": "sales@prematerialsco.com",
        "phone": "+1-987-654-3210",
        "address": "456 Supply Street, Town",
        "paymentTerms": "Net 45",
        "isActive": true,
        "createdAt": "2025-01-20T14:15:00Z",
        "updatedAt": "2025-01-20T14:15:00Z"
      }
    ],
    "total": 2,
    "totalPages": 1,
    "page": 1,
    "limit": 10
  },
  "message": "Suppliers retrieved successfully"
}
```

**Error Response (500):**
```json
{
  "status": 500,
  "message": "Error fetching suppliers",
  "error": "Database connection failed"
}
```

---

### 1.2 Get Supplier by ID
**GET** `/suppliers/{id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Supplier ID |

**Frontend Implementation:**
- Used when viewing supplier details
- Used when fetching supplier info for order creation

**Request Example:**
```bash
curl -X GET "http://localhost:8081/api/suppliers/sup_001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "id": "sup_001",
    "name": "ABC Suppliers Ltd",
    "email": "contact@abcsuppliers.com",
    "phone": "+1-234-567-8900",
    "address": "123 Industrial Ave, City",
    "paymentTerms": "Net 30",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### 1.3 Create Supplier
**POST** `/suppliers`

**Request Body:**
```json
{
  "name": "ABC Suppliers Ltd",
  "email": "contact@abcsuppliers.com",
  "phone": "+1-234-567-8900",
  "address": "123 Industrial Ave, City",
  "paymentTerms": "Net 30"
}
```

**Validation Rules:**
- `name`: Required, string, min 3 characters
- `email`: Required, valid email format
- `phone`: Required, string, min 10 characters
- `address`: Optional, string
- `paymentTerms`: Optional, string

**Frontend Implementation:**
- Location: `src/app/(admin)/supply/suppliers/page.tsx`
- Dialog/Modal form for creating new supplier
- Uses React Hook Form with Zod validation

**Request Example:**
```bash
curl -X POST "http://localhost:8081/api/suppliers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Supply Corp",
    "email": "info@newsupply.com",
    "phone": "+1-555-123-4567",
    "address": "789 Commerce Blvd",
    "paymentTerms": "Net 60"
  }'
```

**Response (201 Created):**
```json
{
  "status": 201,
  "data": {
    "id": "sup_003",
    "name": "New Supply Corp",
    "email": "info@newsupply.com",
    "phone": "+1-555-123-4567",
    "address": "789 Commerce Blvd",
    "paymentTerms": "Net 60",
    "isActive": true,
    "createdAt": "2025-01-25T09:45:00Z",
    "updatedAt": "2025-01-25T09:45:00Z"
  },
  "message": "Supplier created successfully"
}
```

**Error Response (400):**
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

### 1.4 Update Supplier
**PATCH** `/suppliers/{id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Supplier ID |

**Request Body:**
```json
{
  "name": "ABC Suppliers Ltd Updated",
  "email": "newemail@abcsuppliers.com",
  "phone": "+1-234-567-8900",
  "address": "456 New Industrial St",
  "paymentTerms": "Net 45"
}
```

**Frontend Implementation:**
- Location: `src/app/(admin)/supply/suppliers/page.tsx`
- Edit functionality in supplier row
- Pre-fills form with current supplier data

**Request Example:**
```bash
curl -X PATCH "http://localhost:8081/api/suppliers/sup_001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "updated@abcsuppliers.com",
    "paymentTerms": "Net 45"
  }'
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "id": "sup_001",
    "name": "ABC Suppliers Ltd Updated",
    "email": "updated@abcsuppliers.com",
    "phone": "+1-234-567-8900",
    "address": "456 New Industrial St",
    "paymentTerms": "Net 45",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-25T10:45:00Z"
  },
  "message": "Supplier updated successfully"
}
```

---

### 1.5 Delete Supplier
**DELETE** `/suppliers/{id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Supplier ID |

**Frontend Implementation:**
- Location: `src/app/(admin)/supply/suppliers/page.tsx`
- Delete icon in supplier row
- Confirmation dialog before deletion

**Request Example:**
```bash
curl -X DELETE "http://localhost:8081/api/suppliers/sup_001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Supplier deleted successfully"
}
```

**Error Response (409 Conflict):**
```json
{
  "status": 409,
  "message": "Cannot delete supplier with active orders"
}
```

---

## 2. RAW MATERIALS ENDPOINTS

### 2.1 Get Raw Materials
**GET** `/raw-materials`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Records per page (default: 10) |
| search | string | No | Search by material name |
| supplierId | string | No | Filter by specific supplier |

**Frontend Implementation:**
- Used in "Create New Order" page to populate material selection dropdown
- Fetches materials available from selected supplier
- Displays material details: name, unit, cost, lead time

**Request Example:**
```bash
curl -X GET "http://localhost:8081/api/raw-materials?supplierId=sup_001&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "data": [
      {
        "id": "rm_001",
        "name": "Steel Sheets",
        "unit": "kg",
        "unitPrice": 45.50,
        "minimumOrderQty": 100,
        "leadTimeDays": 7,
        "supplierId": "sup_001",
        "supplierName": "ABC Suppliers Ltd",
        "createdAt": "2025-01-10T08:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z"
      },
      {
        "id": "rm_002",
        "name": "Aluminum Wire",
        "unit": "m",
        "unitPrice": 2.30,
        "minimumOrderQty": 500,
        "leadTimeDays": 5,
        "supplierId": "sup_001",
        "supplierName": "ABC Suppliers Ltd",
        "createdAt": "2025-01-10T08:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z"
      }
    ],
    "total": 2,
    "totalPages": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

### 2.2 Create Raw Material
**POST** `/raw-materials`

**Request Body:**
```json
{
  "name": "Steel Sheets",
  "unit": "kg",
  "unitPrice": 45.50,
  "minimumOrderQty": 100,
  "leadTimeDays": 7,
  "supplierId": "sup_001"
}
```

**Validation Rules:**
- `name`: Required, string, min 3 characters
- `unit`: Required, string (e.g., "kg", "m", "pcs", "ltr")
- `unitPrice`: Required, number, min 0
- `minimumOrderQty`: Required, number, min 1
- `leadTimeDays`: Required, number, min 0
- `supplierId`: Required, valid supplier ID reference

**Request Example:**
```bash
curl -X POST "http://localhost:8081/api/raw-materials" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Copper Tubing",
    "unit": "m",
    "unitPrice": 8.75,
    "minimumOrderQty": 50,
    "leadTimeDays": 3,
    "supplierId": "sup_002"
  }'
```

**Response (201 Created):**
```json
{
  "status": 201,
  "data": {
    "id": "rm_003",
    "name": "Copper Tubing",
    "unit": "m",
    "unitPrice": 8.75,
    "minimumOrderQty": 50,
    "leadTimeDays": 3,
    "supplierId": "sup_002",
    "supplierName": "Premium Materials Co",
    "createdAt": "2025-01-25T11:20:00Z",
    "updatedAt": "2025-01-25T11:20:00Z"
  },
  "message": "Raw material created successfully"
}
```

---

## 3. SUPPLIER ORDERS (PURCHASE ORDERS) ENDPOINTS

### 3.1 Create Supplier Order
**POST** `/supplier-orders`

**Frontend Implementation:**
- Location: `src/app/(admin)/supply/new-order/page.tsx`
- Create new purchase order with items from supplier
- Email preview available for supplier order notification
- Multi-step form: Supplier selection → Material selection → Add items → Review

**Request Body:**
```json
{
  "supplierId": "sup_001",
  "deliveryDate": "2025-02-15",
  "notes": "Handle with care. Deliver to warehouse B",
  "items": [
    {
      "rawMaterialId": "rm_001",
      "quantity": 500,
      "unitPrice": 45.50
    },
    {
      "rawMaterialId": "rm_002",
      "quantity": 1000,
      "unitPrice": 2.30
    }
  ]
}
```

**Validation Rules:**
- `supplierId`: Required, valid supplier ID
- `deliveryDate`: Required, must be future date
- `items`: Required array, minimum 1 item
  - `rawMaterialId`: Required, valid material ID
  - `quantity`: Required, number > 0, >= minimumOrderQty
  - `unitPrice`: Required, number >= 0

**Request Example:**
```bash
curl -X POST "http://localhost:8081/api/supplier-orders" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "sup_001",
    "deliveryDate": "2025-02-15",
    "notes": "Standard delivery",
    "items": [
      {
        "rawMaterialId": "rm_001",
        "quantity": 500,
        "unitPrice": 45.50
      }
    ]
  }'
```

**Response (201 Created):**
```json
{
  "status": 201,
  "data": {
    "id": "po_001",
    "supplierId": "sup_001",
    "supplierName": "ABC Suppliers Ltd",
    "deliveryDate": "2025-02-15T00:00:00Z",
    "notes": "Standard delivery",
    "status": "draft",
    "items": [
      {
        "id": "poi_001",
        "rawMaterialId": "rm_001",
        "rawMaterialName": "Steel Sheets",
        "quantity": 500,
        "unit": "kg",
        "unitPrice": 45.50,
        "total": 22750.00
      }
    ],
    "subtotal": 22750.00,
    "tax": 2275.00,
    "total": 25025.00,
    "createdAt": "2025-01-25T12:30:00Z",
    "updatedAt": "2025-01-25T12:30:00Z"
  },
  "message": "Purchase order created successfully"
}
```

**Error Response (400):**
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "items[0].quantity",
      "message": "Quantity must be at least 100 (minimum order quantity)"
    }
  ]
}
```

---

### 3.2 Get All Supplier Orders
**GET** `/supplier-orders`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Records per page (default: 10) |
| status | string | No | Filter by status (draft, sent, confirmed, partial_received, received, invoiced, paid, cancelled) |
| supplierId | string | No | Filter by supplier ID |
| startDate | string | No | Filter orders from date (ISO format) |
| endDate | string | No | Filter orders to date (ISO format) |
| search | string | No | Search by supplier name or PO number |

**Frontend Implementation:**
- Location: `src/app/(admin)/supply/requests/page.tsx`
- Displays all purchase orders in table format
- Status badge with color coding
- Shows supplier, total, delivery date, item count
- Actions: View details, Update status, Upload proof/invoice

**Request Example:**
```bash
curl -X GET "http://localhost:8081/api/supplier-orders?page=1&limit=10&status=sent" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "data": [
      {
        "id": "po_001",
        "supplierId": "sup_001",
        "supplierName": "ABC Suppliers Ltd",
        "deliveryDate": "2025-02-15T00:00:00Z",
        "notes": "Standard delivery",
        "status": "sent",
        "itemCount": 2,
        "total": 25025.00,
        "createdAt": "2025-01-25T12:30:00Z",
        "updatedAt": "2025-01-25T14:00:00Z"
      },
      {
        "id": "po_002",
        "supplierId": "sup_002",
        "supplierName": "Premium Materials Co",
        "deliveryDate": "2025-02-10T00:00:00Z",
        "notes": "Urgent order",
        "status": "confirmed",
        "itemCount": 1,
        "total": 5000.00,
        "createdAt": "2025-01-24T10:15:00Z",
        "updatedAt": "2025-01-24T16:45:00Z"
      }
    ],
    "total": 2,
    "totalPages": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

### 3.3 Get Supplier Order Details
**GET** `/supplier-orders/{id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Purchase Order ID |

**Frontend Implementation:**
- Location: `src/app/(admin)/supply/requests/[id]/page.tsx`
- Shows complete order details with all items
- Status update modal with available transitions
- Upload proof of payment section
- Upload invoice section
- Shows creation/update timestamps

**Request Example:**
```bash
curl -X GET "http://localhost:8081/api/supplier-orders/po_001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "id": "po_001",
    "supplierId": "sup_001",
    "supplierName": "ABC Suppliers Ltd",
    "supplierEmail": "contact@abcsuppliers.com",
    "supplierPhone": "+1-234-567-8900",
    "deliveryDate": "2025-02-15T00:00:00Z",
    "notes": "Handle with care. Deliver to warehouse B",
    "status": "sent",
    "items": [
      {
        "id": "poi_001",
        "rawMaterialId": "rm_001",
        "rawMaterialName": "Steel Sheets",
        "quantity": 500,
        "unit": "kg",
        "unitPrice": 45.50,
        "total": 22750.00
      },
      {
        "id": "poi_002",
        "rawMaterialId": "rm_002",
        "rawMaterialName": "Aluminum Wire",
        "quantity": 1000,
        "unit": "m",
        "unitPrice": 2.30,
        "total": 2300.00
      }
    ],
    "subtotal": 25050.00,
    "tax": 2505.00,
    "total": 27555.00,
    "proofOfPayment": null,
    "invoice": null,
    "createdAt": "2025-01-25T12:30:00Z",
    "updatedAt": "2025-01-25T14:00:00Z"
  }
}
```

---

### 3.4 Update Supplier Order Status
**PATCH** `/supplier-orders/{id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Purchase Order ID |

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Transitions:**
```
draft → sent, cancelled
sent → confirmed, cancelled
confirmed → partial_received, cancelled
partial_received → received, cancelled
received → invoiced, cancelled
invoiced → paid, cancelled
paid → (terminal state)
cancelled → (terminal state)
```

**Frontend Implementation:**
- Location: `src/app/(admin)/supply/requests/page.tsx` and `[id]/page.tsx`
- Status update modal showing available transitions
- Only available transitions for current status are shown

**Request Example:**
```bash
curl -X PATCH "http://localhost:8081/api/supplier-orders/po_001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "id": "po_001",
    "supplierId": "sup_001",
    "supplierName": "ABC Suppliers Ltd",
    "deliveryDate": "2025-02-15T00:00:00Z",
    "notes": "Handle with care. Deliver to warehouse B",
    "status": "confirmed",
    "items": [
      {
        "id": "poi_001",
        "rawMaterialId": "rm_001",
        "rawMaterialName": "Steel Sheets",
        "quantity": 500,
        "unit": "kg",
        "unitPrice": 45.50,
        "total": 22750.00
      }
    ],
    "total": 25025.00,
    "createdAt": "2025-01-25T12:30:00Z",
    "updatedAt": "2025-01-25T15:30:00Z"
  },
  "message": "Purchase order status updated"
}
```

**Error Response (409 Conflict):**
```json
{
  "status": 409,
  "message": "Invalid status transition",
  "currentStatus": "sent",
  "attemptedStatus": "invoiced",
  "validTransitions": ["confirmed", "cancelled"]
}
```

---

### 3.5 Upload Proof of Payment
**POST** `/supplier-orders/{id}/proof-of-payment`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Purchase Order ID |

**Request Body:** (Form Data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | PDF or image file (max 10MB) |

**Frontend Implementation:**
- Location: `src/app/(admin)/supply/requests/[id]/page.tsx`
- File upload button with drag-and-drop support
- Accepts: PDF, PNG, JPG, JPEG
- Shows upload progress
- Displays uploaded file with download link

**Request Example:**
```bash
curl -X POST "http://localhost:8081/api/supplier-orders/po_001/proof-of-payment" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/proof.pdf"
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "id": "po_001",
    "proofOfPayment": {
      "fileName": "proof_po_001.pdf",
      "fileUrl": "http://localhost:8081/uploads/proof-of-payment/proof_po_001.pdf",
      "uploadedAt": "2025-01-25T16:00:00Z",
      "uploadedBy": "user_001"
    }
  },
  "message": "Proof of payment uploaded successfully"
}
```

---

### 3.6 Upload Invoice
**POST** `/supplier-orders/{id}/invoice`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Purchase Order ID |

**Request Body:** (Form Data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Invoice PDF or image (max 10MB) |

**Frontend Implementation:**
- Location: `src/app/(admin)/supply/requests/[id]/page.tsx`
- File upload button with drag-and-drop support
- Accepts: PDF, PNG, JPG, JPEG
- Shows upload progress
- Displays uploaded file with download link

**Request Example:**
```bash
curl -X POST "http://localhost:8081/api/supplier-orders/po_001/invoice" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/invoice.pdf"
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "id": "po_001",
    "invoice": {
      "fileName": "invoice_po_001.pdf",
      "fileUrl": "http://localhost:8081/uploads/invoices/invoice_po_001.pdf",
      "uploadedAt": "2025-01-25T16:05:00Z",
      "uploadedBy": "user_001"
    }
  },
  "message": "Invoice uploaded successfully"
}
```

---

### 3.7 Delete Supplier Order
**DELETE** `/supplier-orders/{id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Purchase Order ID |

**Restrictions:**
- Only draft orders can be deleted
- Orders with status "sent" or higher cannot be deleted

**Request Example:**
```bash
curl -X DELETE "http://localhost:8081/api/supplier-orders/po_001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": 200,
  "message": "Purchase order deleted successfully"
}
```

**Error Response (409 Conflict):**
```json
{
  "status": 409,
  "message": "Cannot delete order with status 'sent'. Only draft orders can be deleted."
}
```

---

## Database Schema Requirements

### Supplier Orders Table
```sql
CREATE TABLE supplier_orders (
  id VARCHAR(36) PRIMARY KEY,
  supplierId VARCHAR(36) NOT NULL,
  deliveryDate TIMESTAMP NOT NULL,
  notes TEXT,
  status ENUM('draft', 'sent', 'confirmed', 'partial_received', 'received', 'invoiced', 'paid', 'cancelled') DEFAULT 'draft',
  proofOfPayment VARCHAR(255),
  invoice VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplierId) REFERENCES suppliers(id)
);
```

### Supplier Order Items Table
```sql
CREATE TABLE supplier_order_items (
  id VARCHAR(36) PRIMARY KEY,
  supplierOrderId VARCHAR(36) NOT NULL,
  rawMaterialId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unitPrice DECIMAL(10,2) NOT NULL,
  total DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unitPrice) STORED,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplierOrderId) REFERENCES supplier_orders(id),
  FOREIGN KEY (rawMaterialId) REFERENCES raw_materials(id)
);
```

---

## Error Handling & Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Successful GET, PATCH request |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Validation failed, invalid input |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | User lacks permission for operation |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Invalid status transition, business logic violation |
| 500 | Server Error | Database/server error |

**Standard Error Response Format:**
```json
{
  "status": 400,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

---

## Authentication

All endpoints (except `/auth/login`) require:
- `Authorization: Bearer {JWT_TOKEN}` header
- Valid JWT token in cookies (automatically handled by axios interceptor)
- Token refresh on 401 Unauthorized response

---

## Frontend API Integration Reference

**Files using these endpoints:**

| File | Endpoints Used | Operations |
|------|---|---|
| `src/app/(admin)/supply/suppliers/page.tsx` | `/suppliers`, `/suppliers/{id}` | GET list, GET detail, POST create, PATCH update, DELETE |
| `src/app/(admin)/supply/new-order/page.tsx` | `/suppliers`, `/raw-materials`, `/supplier-orders` | GET suppliers, GET materials, POST create order |
| `src/app/(admin)/supply/requests/page.tsx` | `/supplier-orders` | GET list, PATCH status update |
| `src/app/(admin)/supply/requests/[id]/page.tsx` | `/supplier-orders/{id}`, `/supplier-orders/{id}/proof-of-payment`, `/supplier-orders/{id}/invoice` | GET detail, PATCH status, POST upload |

---

## HTTP Methods Summary

| Method | Purpose | Used For |
|--------|---------|----------|
| GET | Retrieve data | Fetching suppliers, materials, orders, details |
| POST | Create new resource | Create supplier, material, order, file upload |
| PATCH | Partial update | Update order status, supplier details |
| DELETE | Remove resource | Delete supplier, order |

---

## Response Format Standards

All responses follow this structure:

```json
{
  "status": 200,
  "data": {},
  "message": "Optional message",
  "timestamp": "2025-01-25T12:30:00Z"
}
```

For paginated responses:
```json
{
  "status": 200,
  "data": {
    "data": [],
    "total": 0,
    "totalPages": 0,
    "page": 1,
    "limit": 10
  },
  "message": "Optional message"
}
```
