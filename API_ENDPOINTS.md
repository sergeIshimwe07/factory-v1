# Factory ERP - API Endpoints & Sample Requests/Responses

## Base URL
```
http://localhost:5000/api
```

---

## Authentication Endpoints

### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@factory.com",
    "password": "SecurePass123"
  }'
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMDAxIiwiaWF0IjoxNjQ2NTczMDAwfQ...",
    "user": {
      "id": "usr_001",
      "name": "Admin User",
      "email": "admin@factory.com",
      "role": "admin",
      "avatar": "https://api.example.com/avatars/admin.jpg"
    }
  },
  "timestamp": "2026-03-06T10:30:00Z"
}
```

**Error (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid email or password",
  "code": "AUTH_FAILED"
}
```

---

## Dashboard Endpoints

### GET /dashboard/summary
Fetch dashboard summary with KPIs, charts data, and alerts.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/dashboard/summary?period=month" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "totalSalesToday": 125000,
    "totalSalesMonth": 2850000,
    "outstandingCredit": 450000,
    "topProducts": [
      {
        "productId": "prod_001",
        "productName": "Industrial Motor - 5HP",
        "revenue": 450000,
        "quantity": 15,
        "category": "Machinery"
      },
      {
        "productId": "prod_002",
        "productName": "Control Panel Assembly",
        "revenue": 320000,
        "quantity": 32,
        "category": "Electronics"
      },
      {
        "productId": "prod_003",
        "productName": "Hydraulic Pump",
        "revenue": 280000,
        "quantity": 28
      }
    ],
    "lowStockAlerts": [
      {
        "productId": "prod_015",
        "productName": "Bearing Set 6205",
        "currentStock": 12,
        "minimumStock": 50,
        "reorderLevel": 75,
        "status": "critical"
      },
      {
        "productId": "prod_018",
        "productName": "Sealing Gasket",
        "currentStock": 35,
        "minimumStock": 100,
        "status": "warning"
      }
    ],
    "commissionSummary": {
      "paid": 125000,
      "unpaid": 85000,
      "total": 210000
    },
    "salesTrend": [
      {"date": "2026-03-01", "revenue": 125000, "target": 150000},
      {"date": "2026-03-02", "revenue": 138000, "target": 150000},
      {"date": "2026-03-03", "revenue": 182000, "target": 150000},
      {"date": "2026-03-04", "revenue": 168000, "target": 150000},
      {"date": "2026-03-05", "revenue": 212000, "target": 150000},
      {"date": "2026-03-06", "revenue": 195000, "target": 150000}
    ]
  },
  "timestamp": "2026-03-06T10:30:00Z"
}
```

---

## Sales Endpoints

### GET /sales
List all sales orders with pagination and filtering.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/sales?page=1&limit=10&status=completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "SO-001",
      "orderNumber": "2026-03-001",
      "customerId": "cust_001",
      "customerName": "ABC Industries Ltd",
      "date": "2026-03-05T10:30:00Z",
      "dueDate": "2026-03-12T00:00:00Z",
      "items": [
        {
          "productId": "prod_001",
          "productName": "Industrial Motor - 5HP",
          "quantity": 5,
          "unitPrice": 45000,
          "discount": 0,
          "total": 225000
        }
      ],
      "subtotal": 225000,
      "tax": 22500,
      "discount": 0,
      "total": 247500,
      "status": "completed",
      "paymentStatus": "paid",
      "agent": "John Doe",
      "notes": "Delivery completed on time"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 145,
    "pages": 15,
    "hasMore": true
  }
}
```

### POST /sales
Create a new sales order.

**Request:**
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customerId": "cust_001",
    "items": [
      {
        "productId": "prod_001",
        "quantity": 5,
        "unitPrice": 45000
      },
      {
        "productId": "prod_002",
        "quantity": 3,
        "unitPrice": 32000
      }
    ],
    "discount": 5000,
    "notes": "Standard delivery expected",
    "dueDate": "2026-03-12"
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Sales order created successfully",
  "data": {
    "id": "SO-002",
    "orderNumber": "2026-03-002",
    "customerId": "cust_001",
    "total": 270500,
    "status": "pending"
  },
  "timestamp": "2026-03-06T10:30:00Z"
}
```

### GET /sales/:id
Fetch detailed sales order.

**Request:**
```bash
curl -X GET http://localhost:5000/api/sales/SO-001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "SO-001",
    "orderNumber": "2026-03-001",
    "customerId": "cust_001",
    "customerName": "ABC Industries Ltd",
    "customerEmail": "contact@abc-ind.com",
    "customerPhone": "+92-300-1234567",
    "date": "2026-03-05T10:30:00Z",
    "items": [
      {
        "productId": "prod_001",
        "productName": "Industrial Motor - 5HP",
        "quantity": 5,
        "unitPrice": 45000,
        "total": 225000
      }
    ],
    "total": 247500,
    "status": "completed",
    "paymentDetails": {
      "method": "bank_transfer",
      "reference": "TXN-12345",
      "paidDate": "2026-03-06T09:15:00Z"
    }
  }
}
```

---

## Inventory Endpoints

### GET /products
List all products.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=10&category=Machinery" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "prod_001",
      "name": "Industrial Motor - 5HP",
      "category": "Machinery",
      "unit": "piece",
      "basePrice": 45000,
      "costPrice": 28000,
      "currentStock": 42,
      "minimumStock": 20,
      "reorderLevel": 50,
      "weight": 25,
      "description": "Heavy-duty industrial motor",
      "sku": "MTR-5HP-001",
      "status": "active"
    },
    {
      "id": "prod_002",
      "name": "Control Panel Assembly",
      "category": "Electronics",
      "unit": "piece",
      "basePrice": 32000,
      "costPrice": 22000,
      "currentStock": 68,
      "minimumStock": 30,
      "reorderLevel": 50
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 245,
    "pages": 25
  }
}
```

### POST /products
Create new product.

**Request:**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "New Product X",
    "category": "Electronics",
    "unit": "piece",
    "basePrice": 50000,
    "costPrice": 30000,
    "minimumStock": 25,
    "reorderLevel": 50,
    "description": "High quality product"
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "id": "prod_246",
    "sku": "PROD-246",
    "name": "New Product X"
  }
}
```

### GET /inventory/movements
Get stock movement history.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/inventory/movements?type=receipt&dateFrom=2026-03-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "mov_001",
      "productId": "prod_001",
      "productName": "Industrial Motor - 5HP",
      "type": "receipt",
      "quantity": 20,
      "date": "2026-03-06T09:30:00Z",
      "reference": "PO-125",
      "notes": "Stock replenishment from supplier"
    },
    {
      "id": "mov_002",
      "productId": "prod_001",
      "productName": "Industrial Motor - 5HP",
      "type": "issue",
      "quantity": 5,
      "date": "2026-03-05T14:20:00Z",
      "reference": "SO-001",
      "notes": "Delivered to ABC Industries"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 52,
    "pages": 6
  }
}
```

---

## Production Endpoints

### GET /production
List production entries.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/production?status=completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "prod_entry_001",
      "batchNumber": "BATCH-2026-03-001",
      "billOfMaterialsId": "bom_001",
      "bomName": "Assembly Line A",
      "startDate": "2026-03-05T08:00:00Z",
      "endDate": "2026-03-05T16:30:00Z",
      "quantityProduced": 50,
      "quantityDefective": 2,
      "status": "completed",
      "supervisor": "Ali Khan",
      "notes": "Production on schedule"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 145,
    "pages": 15
  }
}
```

### POST /production
Create production entry.

**Request:**
```bash
curl -X POST http://localhost:5000/api/production \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "billOfMaterialsId": "bom_001",
    "quantityProduced": 50,
    "quantityDefective": 2,
    "supervisor": "Ali Khan",
    "notes": "Production batch completed"
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Production entry created successfully",
  "data": {
    "id": "prod_entry_145",
    "batchNumber": "BATCH-2026-03-145",
    "status": "in_progress"
  }
}
```

---

## Customers Endpoints

### GET /customers
List all customers.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/customers?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "cust_001",
      "name": "ABC Industries Ltd",
      "type": "wholesale",
      "email": "contact@abc-ind.com",
      "phone": "+92-300-1234567",
      "address": "123 Industrial Park",
      "city": "Karachi",
      "creditLimit": 500000,
      "outstandingCredit": 125000,
      "totalSales": 2450000,
      "totalOrders": 35,
      "lastOrderDate": "2026-03-05T10:30:00Z",
      "status": "active",
      "createdDate": "2025-01-15T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 287,
    "pages": 29
  }
}
```

### POST /customers
Create new customer.

**Request:**
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "New Industries Ltd",
    "type": "wholesale",
    "email": "contact@newindustries.com",
    "phone": "+92-300-9876543",
    "address": "456 Trade Street",
    "city": "Lahore",
    "creditLimit": 300000
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Customer created successfully",
  "data": {
    "id": "cust_288",
    "name": "New Industries Ltd"
  }
}
```

---

## Commission Endpoints

### GET /commissions
List commissions.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/commissions?status=unpaid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "comm_001",
      "agentId": "usr_002",
      "agentName": "John Doe",
      "period": "2026-02",
      "saleAmount": 1250000,
      "rate": 2.5,
      "commission": 31250,
      "status": "unpaid",
      "notes": "February commissions calculated"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 148,
    "pages": 15
  }
}
```

### POST /commissions/:id/mark-paid
Mark commission as paid.

**Request:**
```bash
curl -X POST http://localhost:5000/api/commissions/comm_001/mark-paid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reference": "CHQ-12345",
    "paidDate": "2026-03-06"
  }'
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Commission marked as paid",
  "data": {
    "id": "comm_001",
    "status": "paid",
    "paidDate": "2026-03-06T10:30:00Z"
  }
}
```

---

## Accounting Endpoints

### GET /journal
List journal entries.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/journal?dateFrom=2026-03-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "jour_001",
      "type": "sales",
      "date": "2026-03-05T10:30:00Z",
      "reference": "SO-001",
      "entries": [
        {
          "accountId": "acc_1100",
          "accountName": "Sales Revenue",
          "debit": 0,
          "credit": 247500
        },
        {
          "accountId": "acc_1200",
          "accountName": "Accounts Receivable",
          "debit": 247500,
          "credit": 0
        }
      ],
      "status": "posted"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 542,
    "pages": 28
  }
}
```

### POST /journal
Create journal entry.

**Request:**
```bash
curl -X POST http://localhost:5000/api/journal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "adjustment",
    "reference": "ADJ-001",
    "entries": [
      {
        "accountId": "acc_1000",
        "debit": 50000,
        "credit": 0,
        "description": "Cash adjustment"
      },
      {
        "accountId": "acc_1500",
        "debit": 0,
        "credit": 50000,
        "description": "Expense correction"
      }
    ]
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Journal entry created successfully",
  "data": {
    "id": "jour_543",
    "reference": "ADJ-001",
    "status": "draft"
  }
}
```

### GET /accounts
List chart of accounts.

**Request:**
```bash
curl -X GET http://localhost:5000/api/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "acc_1000",
      "code": "1000",
      "name": "Cash",
      "type": "asset",
      "balance": 500000,
      "status": "active"
    },
    {
      "id": "acc_1100",
      "code": "1100",
      "name": "Sales Revenue",
      "type": "revenue",
      "balance": 2850000,
      "status": "active"
    },
    {
      "id": "acc_1200",
      "code": "1200",
      "name": "Accounts Receivable",
      "type": "asset",
      "balance": 450000,
      "status": "active"
    }
  ]
}
```

---

## Users & Roles Endpoints

### GET /users
List all users.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "usr_001",
      "name": "Admin User",
      "email": "admin@factory.com",
      "role": "admin",
      "status": "active",
      "lastLogin": "2026-03-06T09:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### POST /users
Create new user.

**Request:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Sales",
    "email": "john@factory.com",
    "password": "SecurePass123",
    "role": "sales_agent"
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": "usr_045",
    "name": "John Sales",
    "email": "john@factory.com"
  }
}
```

---

## Reports Endpoints

### GET /reports/sales
Generate sales report.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/reports/sales?dateFrom=2026-03-01&dateTo=2026-03-06" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "period": {
      "from": "2026-03-01",
      "to": "2026-03-06"
    },
    "summary": {
      "totalSales": 2850000,
      "totalOrders": 142,
      "averageOrderValue": 20070
    },
    "topCustomers": [
      {
        "customerId": "cust_001",
        "name": "ABC Industries Ltd",
        "totalSales": 500000,
        "orderCount": 12
      }
    ]
  }
}
```

### GET /reports/balance-sheet
Generate balance sheet report.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/reports/balance-sheet?asOfDate=2026-03-06" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "reportDate": "2026-03-06",
    "assets": {
      "current": {
        "cash": 500000,
        "accountsReceivable": 450000,
        "inventory": 2500000,
        "total": 3450000
      },
      "nonCurrent": {
        "fixedAssets": 5000000,
        "total": 5000000
      },
      "totalAssets": 8450000
    },
    "liabilities": {
      "current": {
        "accountsPayable": 250000,
        "total": 250000
      },
      "nonCurrent": {
        "longTermDebt": 1000000,
        "total": 1000000
      },
      "totalLiabilities": 1250000
    },
    "equity": {
      "capitalStock": 5000000,
      "retainedEarnings": 2200000,
      "totalEquity": 7200000
    }
  }
}
```

---

## Payments Endpoints

### GET /payments
List all payments with pagination and filtering.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/payments?page=1&limit=10&customerId=cust_001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "pay_001",
      "saleId": "SO-001",
      "saleInvoice": "INV-2026-001",
      "customerId": "cust_001",
      "customerName": "ABC Industries Ltd",
      "amount": 125000,
      "method": "bank_transfer",
      "reference": "TXN-12345",
      "notes": "Payment for Invoice INV-2026-001",
      "createdAt": "2026-03-06T10:30:00Z",
      "createdBy": "John Doe"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 287,
    "pages": 29
  }
}
```

### POST /payments
Record a new payment.

**Request:**
```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "saleId": "SO-001",
    "amount": 125000,
    "method": "bank_transfer",
    "reference": "TXN-12345",
    "notes": "Full payment received"
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Payment recorded successfully",
  "data": {
    "id": "pay_288",
    "saleId": "SO-001",
    "amount": 125000,
    "updatedSaleStatus": "paid"
  }
}
```

### GET /payments/:id
Get payment details.

**Request:**
```bash
curl -X GET http://localhost:5000/api/payments/pay_001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "pay_001",
    "saleId": "SO-001",
    "saleInvoice": "INV-2026-001",
    "customerId": "cust_001",
    "customerName": "ABC Industries Ltd",
    "amount": 125000,
    "method": "bank_transfer",
    "reference": "TXN-12345",
    "notes": "Payment for Invoice INV-2026-001",
    "createdAt": "2026-03-06T10:30:00Z",
    "createdBy": "John Doe"
  }
}
```

---

## Suppliers Endpoints

### GET /suppliers
List all suppliers.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/suppliers?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "sup_001",
      "name": "Raw Materials Co.",
      "email": "contact@rawmaterials.com",
      "phone": "+92-300-1111111",
      "address": "Industrial Zone, Karachi",
      "contactPerson": "Ahmed Ali",
      "status": "active",
      "totalPurchases": 1250000,
      "outstandingBalance": 250000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### POST /suppliers
Create new supplier.

**Request:**
```bash
curl -X POST http://localhost:5000/api/suppliers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "New Supplier Ltd",
    "email": "contact@newsupplier.com",
    "phone": "+92-300-2222222",
    "address": "123 Supply Street",
    "contactPerson": "Hassan Khan"
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Supplier created successfully",
  "data": {
    "id": "sup_046",
    "name": "New Supplier Ltd"
  }
}
```

### PATCH /suppliers/:id
Update supplier information.

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/suppliers/sup_001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phone": "+92-300-9999999",
    "email": "newemail@rawmaterials.com"
  }'
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Supplier updated successfully"
}
```

---

## Bill of Materials (BOM) Endpoints

### GET /production/bom
List all BOMs.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/production/bom?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "bom_001",
      "finishedProductId": "prod_001",
      "finishedProductName": "Industrial Motor - 5HP",
      "items": [
        {
          "id": "bom_item_001",
          "rawMaterialId": "prod_050",
          "rawMaterialName": "Copper Wire - 2mm",
          "quantityRequired": 25,
          "unit": "meters"
        },
        {
          "id": "bom_item_002",
          "rawMaterialId": "prod_051",
          "rawMaterialName": "Steel Casing",
          "quantityRequired": 1,
          "unit": "piece"
        }
      ],
      "status": "active",
      "createdAt": "2026-01-15T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 28,
    "pages": 3
  }
}
```

### POST /production/bom
Create new BOM.

**Request:**
```bash
curl -X POST http://localhost:5000/api/production/bom \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "finishedProductId": "prod_001",
    "items": [
      {
        "rawMaterialId": "prod_050",
        "quantityRequired": 25,
        "unit": "meters"
      },
      {
        "rawMaterialId": "prod_051",
        "quantityRequired": 1,
        "unit": "piece"
      }
    ]
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "BOM created successfully",
  "data": {
    "id": "bom_029",
    "finishedProductId": "prod_001"
  }
}
```

### GET /production/bom/:finishedProductId
Get BOM for a specific finished product.

**Request:**
```bash
curl -X GET http://localhost:5000/api/production/bom/prod_001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "bom_001",
    "finishedProductId": "prod_001",
    "finishedProductName": "Industrial Motor - 5HP",
    "items": [
      {
        "id": "bom_item_001",
        "rawMaterialId": "prod_050",
        "rawMaterialName": "Copper Wire - 2mm",
        "quantityRequired": 25,
        "unit": "meters"
      }
    ]
  }
}
```

---

## Stock Movements Endpoints

### GET /inventory/movements
Get stock movement history.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/inventory/movements?type=receipt&dateFrom=2026-03-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "mov_001",
      "productId": "prod_001",
      "productName": "Industrial Motor - 5HP",
      "type": "receipt",
      "quantity": 20,
      "date": "2026-03-06T09:30:00Z",
      "reference": "PO-125",
      "notes": "Stock replenishment from supplier",
      "createdBy": "Store Manager"
    },
    {
      "id": "mov_002",
      "productId": "prod_001",
      "productName": "Industrial Motor - 5HP",
      "type": "issue",
      "quantity": 5,
      "date": "2026-03-05T14:20:00Z",
      "reference": "SO-001",
      "notes": "Delivered to ABC Industries"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 52,
    "pages": 6
  }
}
```

### POST /inventory/movements
Record stock movement.

**Request:**
```bash
curl -X POST http://localhost:5000/api/inventory/movements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "prod_001",
    "type": "adjustment",
    "quantity": 5,
    "reference": "ADJ-001",
    "notes": "Stock count adjustment"
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Stock movement recorded successfully",
  "data": {
    "id": "mov_053",
    "productId": "prod_001",
    "newStock": 47
  }
}
```

---

## Commission Rules Endpoints

### GET /commissions/rules
List commission rules.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/commissions/rules" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "rule_001",
      "productId": "prod_001",
      "productName": "Industrial Motor - 5HP",
      "type": "percentage",
      "value": 2.5,
      "status": "active"
    },
    {
      "id": "rule_002",
      "productId": "prod_002",
      "productName": "Control Panel Assembly",
      "type": "fixed",
      "value": 5000,
      "status": "active"
    }
  ]
}
```

### POST /commissions/rules
Create commission rule.

**Request:**
```bash
curl -X POST http://localhost:5000/api/commissions/rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "prod_001",
    "type": "percentage",
    "value": 2.5
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Commission rule created successfully",
  "data": {
    "id": "rule_003",
    "productId": "prod_001"
  }
}
```

### PATCH /commissions/rules/:id
Update commission rule.

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/commissions/rules/rule_001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "value": 3.0
  }'
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Commission rule updated successfully"
}
```

### DELETE /commissions/rules/:id
Delete commission rule.

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/commissions/rules/rule_001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Commission rule deleted successfully"
}
```

---

## Additional Customer Endpoints

### PATCH /customers/:id/toggle-block
Block or unblock a customer.

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/customers/cust_001/toggle-block \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Customer blocked successfully",
  "data": {
    "id": "cust_001",
    "isBlocked": true
  }
}
```

### GET /customers/:id
Get customer details with sales history.

**Request:**
```bash
curl -X GET http://localhost:5000/api/customers/cust_001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "cust_001",
    "name": "ABC Industries Ltd",
    "email": "contact@abc-ind.com",
    "phone": "+92-300-1234567",
    "address": "123 Industrial Park",
    "creditLimit": 500000,
    "creditBalance": 125000,
    "isBlocked": false,
    "totalSales": 2450000,
    "totalOrders": 35,
    "createdAt": "2025-01-15T09:00:00Z"
  }
}
```

---

## Additional Reports Endpoints

### GET /reports/customers
Generate customer report.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/reports/customers?dateFrom=2026-03-01&dateTo=2026-03-06" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "period": {
      "from": "2026-03-01",
      "to": "2026-03-06"
    },
    "summary": {
      "totalCustomers": 287,
      "activeCustomers": 245,
      "blockedCustomers": 12,
      "totalCreditLimit": 125000000,
      "totalOutstanding": 15250000
    },
    "topCustomers": [
      {
        "customerId": "cust_001",
        "name": "ABC Industries Ltd",
        "totalSales": 2450000,
        "orderCount": 35,
        "creditUsed": 125000
      }
    ]
  }
}
```

### GET /reports/inventory
Generate inventory report.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/reports/inventory?category=Machinery" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "totalProducts": 245,
    "totalValue": 12500000,
    "lowStockCount": 15,
    "rows": [
      {
        "productId": "prod_001",
        "productName": "Industrial Motor - 5HP",
        "category": "Machinery",
        "currentStock": 42,
        "minimumStock": 20,
        "unitCost": 28000,
        "stockValue": 1176000,
        "isLowStock": false
      }
    ]
  }
}
```

### GET /reports/production
Generate production report.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/reports/production?dateFrom=2026-03-01&dateTo=2026-03-06" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "period": {
      "from": "2026-03-01",
      "to": "2026-03-06"
    },
    "summary": {
      "totalBatches": 45,
      "totalUnitsProduced": 1250,
      "totalDefective": 25,
      "defectiveRate": 2.0
    },
    "byProduct": [
      {
        "productId": "prod_001",
        "productName": "Industrial Motor - 5HP",
        "quantityProduced": 250,
        "quantityDefective": 5
      }
    ]
  }
}
```

### GET /reports/commissions
Generate commissions report.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/reports/commissions?month=2026-03" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "period": "2026-03",
    "summary": {
      "totalCommissions": 210000,
      "paidCommissions": 125000,
      "unpaidCommissions": 85000
    },
    "byAgent": [
      {
        "agentId": "usr_002",
        "agentName": "John Doe",
        "totalSales": 1250000,
        "commissionEarned": 31250,
        "commissionPaid": 31250,
        "commissionUnpaid": 0
      }
    ]
  }
}
```

### GET /reports/profit-loss
Generate profit & loss statement.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/reports/profit-loss?dateFrom=2026-03-01&dateTo=2026-03-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "period": {
      "from": "2026-03-01",
      "to": "2026-03-31"
    },
    "revenue": {
      "sales": 2850000,
      "otherIncome": 50000,
      "totalRevenue": 2900000
    },
    "expenses": {
      "costOfGoodsSold": 1800000,
      "operatingExpenses": 450000,
      "commissions": 85000,
      "totalExpenses": 2335000
    },
    "netProfit": 565000,
    "profitMargin": 19.48
  }
}
```

---

## Additional User Management Endpoints

### PATCH /users/:id/toggle-active
Activate or deactivate a user.

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/users/usr_002/toggle-active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User deactivated successfully",
  "data": {
    "id": "usr_002",
    "isActive": false
  }
}
```

### POST /users/:id/reset-password
Reset user password (admin only).

**Request:**
```bash
curl -X POST http://localhost:5000/api/users/usr_002/reset-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "newPassword": "NewSecurePass123"
  }'
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid request parameters",
  "errors": [
    {"field": "email", "message": "Email is required"}
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized - Please login first",
  "code": "AUTH_REQUIRED"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "Access denied - Insufficient permissions",
  "code": "PERMISSION_DENIED"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found",
  "code": "NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error",
  "code": "SERVER_ERROR",
  "requestId": "req_12345"
}
```

---

## Authentication

All protected endpoints require JWT Token in Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## API Features

- ✅ **Pagination**: All list endpoints support `page` and `limit` parameters
- ✅ **Filtering**: Most endpoints support specific filters
- ✅ **Sorting**: Results can be sorted by various fields
- ✅ **Search**: Text search on relevant fields
- ✅ **Timestamps**: All responses include `timestamp` field in ISO 8601 format
- ✅ **Request ID**: Errors include `requestId` for debugging

---

## Rate Limiting

- **Limit**: 1000 requests per hour per IP
- **Headers**: 
  - `X-RateLimit-Limit: 1000`
  - `X-RateLimit-Remaining: 999`
  - `X-RateLimit-Reset: 1646574000`

