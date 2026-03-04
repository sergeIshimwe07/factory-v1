# Factory ERP - API Endpoints Documentation

**Base URL:** `http://localhost:8080/api`  
**Authentication:** Bearer Token (JWT) in Authorization header

---

## 1. DASHBOARD

### GET /dashboard/summary
Get dashboard overview with key metrics

**Request:**
```json
GET /dashboard/summary
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSalesToday": 15000,
    "totalSalesMonth": 450000,
    "outstandingCredit": 75000,
    "topProducts": [
      {
        "productName": "Product A",
        "quantity": 120,
        "revenue": 60000
      }
    ],
    "lowStockAlerts": [
      {
        "productId": "prod-123",
        "productName": "Raw Material B",
        "currentStock": 50,
        "minimumStock": 100
      }
    ],
    "commissionSummary": {
      "total": 25000,
      "paid": 15000,
      "unpaid": 10000
    }
  }
}
```

---

## 2. CUSTOMERS

### GET /customers
List all customers with pagination

**Request:**
```json
GET /customers?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "cust-001",
        "name": "ABC Corporation",
        "email": "contact@abc.com",
        "phone": "+1-555-0001",
        "address": "123 Business St",
        "creditLimit": 100000,
        "creditBalance": 45000,
        "isBlocked": false,
        "createdAt": "2025-01-15T10:30:00Z",
        "updatedAt": "2025-03-04T14:20:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### GET /customers/:id
Get customer by ID

**Request:**
```json
GET /customers/cust-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cust-001",
    "name": "ABC Corporation",
    "email": "contact@abc.com",
    "phone": "+1-555-0001",
    "address": "123 Business St",
    "creditLimit": 100000,
    "creditBalance": 45000,
    "isBlocked": false,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-03-04T14:20:00Z"
  }
}
```

### POST /customers
Create new customer

**Request:**
```json
{
  "name": "New Customer Ltd",
  "email": "new@customer.com",
  "phone": "+1-555-9999",
  "address": "456 Trade Ave",
  "creditLimit": 50000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "cust-002",
    "name": "New Customer Ltd",
    "email": "new@customer.com",
    "phone": "+1-555-9999",
    "address": "456 Trade Ave",
    "creditLimit": 50000,
    "creditBalance": 0,
    "isBlocked": false,
    "createdAt": "2025-03-04T15:00:00Z",
    "updatedAt": "2025-03-04T15:00:00Z"
  }
}
```

### PUT /customers/:id
Update customer

**Request:**
```json
{
  "name": "Updated Customer Ltd",
  "email": "updated@customer.com",
  "phone": "+1-555-8888",
  "address": "789 Commerce Blvd",
  "creditLimit": 75000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "id": "cust-001",
    "name": "Updated Customer Ltd",
    "email": "updated@customer.com",
    "phone": "+1-555-8888",
    "address": "789 Commerce Blvd",
    "creditLimit": 75000,
    "creditBalance": 45000,
    "isBlocked": false,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-03-04T15:10:00Z"
  }
}
```

### DELETE /customers/:id
Delete customer

**Request:**
```json
DELETE /customers/cust-001
```

**Response (200):**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

## 3. SUPPLIERS

### GET /suppliers
List all suppliers with pagination

**Request:**
```json
GET /suppliers?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "supp-001",
        "name": "Raw Materials Inc",
        "email": "sales@rawmaterials.com",
        "phone": "+1-555-1001",
        "address": "100 Supply Road",
        "createdAt": "2025-01-20T09:00:00Z",
        "updatedAt": "2025-03-04T14:00:00Z"
      }
    ],
    "total": 30,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

### GET /suppliers/:id
Get supplier by ID

**Request:**
```json
GET /suppliers/supp-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "supp-001",
    "name": "Raw Materials Inc",
    "email": "sales@rawmaterials.com",
    "phone": "+1-555-1001",
    "address": "100 Supply Road",
    "createdAt": "2025-01-20T09:00:00Z",
    "updatedAt": "2025-03-04T14:00:00Z"
  }
}
```

### POST /suppliers
Create new supplier

**Request:**
```json
{
  "name": "Quality Supplies Co",
  "email": "info@qualitysupplies.com",
  "phone": "+1-555-2000",
  "address": "200 Industrial Park"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": {
    "id": "supp-002",
    "name": "Quality Supplies Co",
    "email": "info@qualitysupplies.com",
    "phone": "+1-555-2000",
    "address": "200 Industrial Park",
    "createdAt": "2025-03-04T15:05:00Z",
    "updatedAt": "2025-03-04T15:05:00Z"
  }
}
```

### PUT /suppliers/:id
Update supplier

**Request:**
```json
{
  "name": "Quality Supplies Co Ltd",
  "email": "contact@qualitysupplies.com",
  "phone": "+1-555-2001",
  "address": "201 Industrial Park"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Supplier updated successfully",
  "data": {
    "id": "supp-001",
    "name": "Quality Supplies Co Ltd",
    "email": "contact@qualitysupplies.com",
    "phone": "+1-555-2001",
    "address": "201 Industrial Park",
    "createdAt": "2025-01-20T09:00:00Z",
    "updatedAt": "2025-03-04T15:15:00Z"
  }
}
```

### DELETE /suppliers/:id
Delete supplier

**Request:**
```json
DELETE /suppliers/supp-001
```

**Response (200):**
```json
{
  "success": true,
  "message": "Supplier deleted successfully"
}
```

---

## 4. INVENTORY - PRODUCTS

### GET /inventory/products
List all products with pagination and filtering

**Request:**
```json
GET /inventory/products?page=1&limit=20&category=electronics&search=widget
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "prod-001",
        "name": "Widget A",
        "category": "electronics",
        "unit": "piece",
        "costPrice": 50,
        "basePrice": 100,
        "minimumPrice": 80,
        "currentStock": 250,
        "minimumStock": 50,
        "commissionRule": {
          "id": "comm-001",
          "productId": "prod-001",
          "type": "percentage",
          "value": 5
        },
        "createdAt": "2025-01-10T08:00:00Z",
        "updatedAt": "2025-03-04T13:00:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### GET /inventory/products/:id
Get product by ID

**Request:**
```json
GET /inventory/products/prod-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prod-001",
    "name": "Widget A",
    "category": "electronics",
    "unit": "piece",
    "costPrice": 50,
    "basePrice": 100,
    "minimumPrice": 80,
    "currentStock": 250,
    "minimumStock": 50,
    "commissionRule": {
      "id": "comm-001",
      "productId": "prod-001",
      "type": "percentage",
      "value": 5
    },
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": "2025-03-04T13:00:00Z"
  }
}
```

### POST /inventory/products
Create new product

**Request:**
```json
{
  "name": "New Widget",
  "category": "electronics",
  "unit": "piece",
  "costPrice": 45,
  "basePrice": 95,
  "minimumPrice": 75,
  "minimumStock": 30
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "prod-002",
    "name": "New Widget",
    "category": "electronics",
    "unit": "piece",
    "costPrice": 45,
    "basePrice": 95,
    "minimumPrice": 75,
    "currentStock": 0,
    "minimumStock": 30,
    "createdAt": "2025-03-04T15:20:00Z",
    "updatedAt": "2025-03-04T15:20:00Z"
  }
}
```

### PUT /inventory/products/:id
Update product

**Request:**
```json
{
  "name": "Updated Widget",
  "basePrice": 105,
  "minimumPrice": 85,
  "minimumStock": 40
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "prod-001",
    "name": "Updated Widget",
    "category": "electronics",
    "unit": "piece",
    "costPrice": 50,
    "basePrice": 105,
    "minimumPrice": 85,
    "currentStock": 250,
    "minimumStock": 40,
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": "2025-03-04T15:25:00Z"
  }
}
```

### DELETE /inventory/products/:id
Delete product

**Request:**
```json
DELETE /inventory/products/prod-001
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 5. INVENTORY - STOCK MOVEMENTS

### GET /inventory/stock-movements
List stock movements with filters

**Request:**
```json
GET /inventory/stock-movements?page=1&limit=20&productId=prod-001&movementType=sale&startDate=2025-03-01&endDate=2025-03-04
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "move-001",
        "productId": "prod-001",
        "productName": "Widget A",
        "movementType": "sale",
        "quantity": 50,
        "referenceId": "sale-123",
        "referenceType": "Sale",
        "notes": "Shipped to customer order",
        "createdAt": "2025-03-04T10:00:00Z",
        "createdBy": "agent-001"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### POST /inventory/stock-movements
Create stock movement (adjustment)

**Request:**
```json
{
  "productId": "prod-001",
  "movementType": "adjustment",
  "quantity": 25,
  "notes": "Physical count adjustment"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Stock movement recorded successfully",
  "data": {
    "id": "move-999",
    "productId": "prod-001",
    "productName": "Widget A",
    "movementType": "adjustment",
    "quantity": 25,
    "referenceId": "move-999",
    "referenceType": "Adjustment",
    "notes": "Physical count adjustment",
    "createdAt": "2025-03-04T15:30:00Z",
    "createdBy": "user-001"
  }
}
```

---

## 6. SALES

### GET /sales
List all sales with pagination and filters

**Request:**
```json
GET /sales?page=1&limit=20&agentId=agent-001&customerId=cust-001&status=paid&startDate=2025-03-01&endDate=2025-03-04
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "sale-001",
        "invoiceNumber": "INV-2025-001",
        "customerId": "cust-001",
        "customerName": "ABC Corporation",
        "agentId": "agent-001",
        "agentName": "John Doe",
        "items": [
          {
            "id": "item-001",
            "productId": "prod-001",
            "productName": "Widget A",
            "quantity": 50,
            "unit": "piece",
            "unitPrice": 100,
            "discount": 500,
            "total": 4500
          }
        ],
        "subtotal": 5000,
        "totalDiscount": 500,
        "totalAmount": 4500,
        "paidAmount": 4500,
        "status": "paid",
        "createdAt": "2025-03-04T10:30:00Z",
        "updatedAt": "2025-03-04T14:15:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### GET /sales/:id
Get sale by ID

**Request:**
```json
GET /sales/sale-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "sale-001",
    "invoiceNumber": "INV-2025-001",
    "customerId": "cust-001",
    "customerName": "ABC Corporation",
    "agentId": "agent-001",
    "agentName": "John Doe",
    "items": [
      {
        "id": "item-001",
        "productId": "prod-001",
        "productName": "Widget A",
        "quantity": 50,
        "unit": "piece",
        "unitPrice": 100,
        "discount": 500,
        "total": 4500
      }
    ],
    "subtotal": 5000,
    "totalDiscount": 500,
    "totalAmount": 4500,
    "paidAmount": 4500,
    "status": "paid",
    "createdAt": "2025-03-04T10:30:00Z",
    "updatedAt": "2025-03-04T14:15:00Z"
  }
}
```

### POST /sales
Create new sale

**Request:**
```json
{
  "customerId": "cust-001",
  "agentId": "agent-001",
  "items": [
    {
      "productId": "prod-001",
      "quantity": 50,
      "unitPrice": 100,
      "discount": 500
    },
    {
      "productId": "prod-002",
      "quantity": 30,
      "unitPrice": 95,
      "discount": 0
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Sale created successfully",
  "data": {
    "id": "sale-002",
    "invoiceNumber": "INV-2025-002",
    "customerId": "cust-001",
    "customerName": "ABC Corporation",
    "agentId": "agent-001",
    "agentName": "John Doe",
    "items": [
      {
        "id": "item-002",
        "productId": "prod-001",
        "productName": "Widget A",
        "quantity": 50,
        "unit": "piece",
        "unitPrice": 100,
        "discount": 500,
        "total": 4500
      },
      {
        "id": "item-003",
        "productId": "prod-002",
        "productName": "New Widget",
        "quantity": 30,
        "unit": "piece",
        "unitPrice": 95,
        "discount": 0,
        "total": 2850
      }
    ],
    "subtotal": 7350,
    "totalDiscount": 500,
    "totalAmount": 6850,
    "paidAmount": 0,
    "status": "unpaid",
    "createdAt": "2025-03-04T15:35:00Z",
    "updatedAt": "2025-03-04T15:35:00Z"
  }
}
```

### PUT /sales/:id
Update sale

**Request:**
```json
{
  "items": [
    {
      "productId": "prod-001",
      "quantity": 60,
      "unitPrice": 100,
      "discount": 600
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sale updated successfully",
  "data": {
    "id": "sale-001",
    "invoiceNumber": "INV-2025-001",
    "customerId": "cust-001",
    "customerName": "ABC Corporation",
    "agentId": "agent-001",
    "agentName": "John Doe",
    "items": [
      {
        "id": "item-001",
        "productId": "prod-001",
        "productName": "Widget A",
        "quantity": 60,
        "unit": "piece",
        "unitPrice": 100,
        "discount": 600,
        "total": 5400
      }
    ],
    "subtotal": 6000,
    "totalDiscount": 600,
    "totalAmount": 5400,
    "paidAmount": 4500,
    "status": "partial",
    "createdAt": "2025-03-04T10:30:00Z",
    "updatedAt": "2025-03-04T15:40:00Z"
  }
}
```

### DELETE /sales/:id
Delete sale

**Request:**
```json
DELETE /sales/sale-001
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sale deleted successfully"
}
```

---

## 7. SALES - PAYMENTS

### GET /sales/:saleId/payments
Get all payments for a sale

**Request:**
```json
GET /sales/sale-001/payments
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "pay-001",
      "saleId": "sale-001",
      "amount": 2500,
      "method": "bank_transfer",
      "reference": "TRF-2025-001",
      "createdAt": "2025-03-02T11:00:00Z",
      "createdBy": "user-001"
    },
    {
      "id": "pay-002",
      "saleId": "sale-001",
      "amount": 2000,
      "method": "cash",
      "reference": "CASH-2025-001",
      "createdAt": "2025-03-04T10:00:00Z",
      "createdBy": "user-001"
    }
  ]
}
```

### POST /sales/:saleId/payments
Record payment for a sale

**Request:**
```json
{
  "amount": 2500,
  "method": "bank_transfer",
  "reference": "TRF-2025-005"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "id": "pay-005",
    "saleId": "sale-001",
    "amount": 2500,
    "method": "bank_transfer",
    "reference": "TRF-2025-005",
    "createdAt": "2025-03-04T15:45:00Z",
    "createdBy": "user-001"
  }
}
```

---

## 8. PRODUCTION - BILL OF MATERIALS

### GET /production/bom
List all Bills of Materials with pagination

**Request:**
```json
GET /production/bom?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "bom-001",
        "finishedProductId": "prod-001",
        "finishedProductName": "Widget A",
        "items": [
          {
            "id": "bom-item-001",
            "rawMaterialId": "mat-001",
            "rawMaterialName": "Steel Sheet",
            "quantityRequired": 10,
            "unit": "kg"
          },
          {
            "id": "bom-item-002",
            "rawMaterialId": "mat-002",
            "rawMaterialName": "Bolt",
            "quantityRequired": 50,
            "unit": "piece"
          }
        ],
        "createdAt": "2025-02-01T09:00:00Z",
        "updatedAt": "2025-02-15T10:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

### GET /production/bom/:id
Get BOM by ID

**Request:**
```json
GET /production/bom/bom-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "bom-001",
    "finishedProductId": "prod-001",
    "finishedProductName": "Widget A",
    "items": [
      {
        "id": "bom-item-001",
        "rawMaterialId": "mat-001",
        "rawMaterialName": "Steel Sheet",
        "quantityRequired": 10,
        "unit": "kg"
      },
      {
        "id": "bom-item-002",
        "rawMaterialId": "mat-002",
        "rawMaterialName": "Bolt",
        "quantityRequired": 50,
        "unit": "piece"
      }
    ],
    "createdAt": "2025-02-01T09:00:00Z",
    "updatedAt": "2025-02-15T10:30:00Z"
  }
}
```

### POST /production/bom
Create new BOM

**Request:**
```json
{
  "finishedProductId": "prod-002",
  "items": [
    {
      "rawMaterialId": "mat-001",
      "quantityRequired": 15
    },
    {
      "rawMaterialId": "mat-003",
      "quantityRequired": 100
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Bill of Materials created successfully",
  "data": {
    "id": "bom-002",
    "finishedProductId": "prod-002",
    "finishedProductName": "New Widget",
    "items": [
      {
        "id": "bom-item-003",
        "rawMaterialId": "mat-001",
        "rawMaterialName": "Steel Sheet",
        "quantityRequired": 15,
        "unit": "kg"
      },
      {
        "id": "bom-item-004",
        "rawMaterialId": "mat-003",
        "rawMaterialName": "Paint",
        "quantityRequired": 100,
        "unit": "ml"
      }
    ],
    "createdAt": "2025-03-04T15:50:00Z",
    "updatedAt": "2025-03-04T15:50:00Z"
  }
}
```

### PUT /production/bom/:id
Update BOM

**Request:**
```json
{
  "items": [
    {
      "rawMaterialId": "mat-001",
      "quantityRequired": 12
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bill of Materials updated successfully",
  "data": {
    "id": "bom-001",
    "finishedProductId": "prod-001",
    "finishedProductName": "Widget A",
    "items": [
      {
        "id": "bom-item-001",
        "rawMaterialId": "mat-001",
        "rawMaterialName": "Steel Sheet",
        "quantityRequired": 12,
        "unit": "kg"
      }
    ],
    "createdAt": "2025-02-01T09:00:00Z",
    "updatedAt": "2025-03-04T15:55:00Z"
  }
}
```

### DELETE /production/bom/:id
Delete BOM

**Request:**
```json
DELETE /production/bom/bom-001
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bill of Materials deleted successfully"
}
```

---

## 9. PRODUCTION - ENTRIES

### GET /production/entries
List production entries with pagination

**Request:**
```json
GET /production/entries?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "prod-ent-001",
        "finishedProductId": "prod-001",
        "finishedProductName": "Widget A",
        "quantityProduced": 100,
        "materialsUsed": [
          {
            "materialId": "mat-001",
            "materialName": "Steel Sheet",
            "quantity": 1000
          },
          {
            "materialId": "mat-002",
            "materialName": "Bolt",
            "quantity": 5000
          }
        ],
        "status": "completed",
        "createdAt": "2025-03-03T08:00:00Z",
        "createdBy": "user-002"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### GET /production/entries/:id
Get production entry by ID

**Request:**
```json
GET /production/entries/prod-ent-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prod-ent-001",
    "finishedProductId": "prod-001",
    "finishedProductName": "Widget A",
    "quantityProduced": 100,
    "materialsUsed": [
      {
        "materialId": "mat-001",
        "materialName": "Steel Sheet",
        "quantity": 1000
      },
      {
        "materialId": "mat-002",
        "materialName": "Bolt",
        "quantity": 5000
      }
    ],
    "status": "completed",
    "createdAt": "2025-03-03T08:00:00Z",
    "createdBy": "user-002"
  }
}
```

### POST /production/entries
Create production entry

**Request:**
```json
{
  "finishedProductId": "prod-001",
  "quantityProduced": 150,
  "materialsUsed": [
    {
      "materialId": "mat-001",
      "quantity": 1500
    },
    {
      "materialId": "mat-002",
      "quantity": 7500
    }
  ],
  "status": "completed"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Production entry created successfully",
  "data": {
    "id": "prod-ent-002",
    "finishedProductId": "prod-001",
    "finishedProductName": "Widget A",
    "quantityProduced": 150,
    "materialsUsed": [
      {
        "materialId": "mat-001",
        "materialName": "Steel Sheet",
        "quantity": 1500
      },
      {
        "materialId": "mat-002",
        "materialName": "Bolt",
        "quantity": 7500
      }
    ],
    "status": "completed",
    "createdAt": "2025-03-04T16:00:00Z",
    "createdBy": "user-001"
  }
}
```

### PUT /production/entries/:id
Update production entry

**Request:**
```json
{
  "status": "cancelled"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Production entry updated successfully",
  "data": {
    "id": "prod-ent-001",
    "finishedProductId": "prod-001",
    "finishedProductName": "Widget A",
    "quantityProduced": 100,
    "materialsUsed": [
      {
        "materialId": "mat-001",
        "materialName": "Steel Sheet",
        "quantity": 1000
      }
    ],
    "status": "cancelled",
    "createdAt": "2025-03-03T08:00:00Z",
    "createdBy": "user-002"
  }
}
```

---

## 10. COMMISSIONS - RULES

### GET /commissions/rules
List commission rules with pagination

**Request:**
```json
GET /commissions/rules?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "comm-001",
        "productId": "prod-001",
        "type": "percentage",
        "value": 5,
        "createdAt": "2025-01-15T08:00:00Z"
      },
      {
        "id": "comm-002",
        "category": "electronics",
        "type": "percentage",
        "value": 8,
        "createdAt": "2025-01-20T09:00:00Z"
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### POST /commissions/rules
Create commission rule

**Request:**
```json
{
  "productId": "prod-003",
  "type": "fixed",
  "value": 100
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Commission rule created successfully",
  "data": {
    "id": "comm-003",
    "productId": "prod-003",
    "type": "fixed",
    "value": 100,
    "createdAt": "2025-03-04T16:05:00Z"
  }
}
```

### PUT /commissions/rules/:id
Update commission rule

**Request:**
```json
{
  "value": 6
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Commission rule updated successfully",
  "data": {
    "id": "comm-001",
    "productId": "prod-001",
    "type": "percentage",
    "value": 6,
    "createdAt": "2025-01-15T08:00:00Z"
  }
}
```

### DELETE /commissions/rules/:id
Delete commission rule

**Request:**
```json
DELETE /commissions/rules/comm-001
```

**Response (200):**
```json
{
  "success": true,
  "message": "Commission rule deleted successfully"
}
```

---

## 11. COMMISSIONS - SUMMARY

### GET /commissions/summary
Get commission summary

**Request:**
```json
GET /commissions/summary?startDate=2025-03-01&endDate=2025-03-04&agentId=agent-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 25000,
    "paid": 15000,
    "unpaid": 10000,
    "commissions": [
      {
        "id": "comm-sal-001",
        "saleId": "sale-001",
        "agentId": "agent-001",
        "agentName": "John Doe",
        "amount": 450,
        "isPaid": true,
        "paidAt": "2025-03-03T14:00:00Z",
        "createdAt": "2025-03-01T10:00:00Z"
      },
      {
        "id": "comm-sal-002",
        "saleId": "sale-002",
        "agentId": "agent-001",
        "agentName": "John Doe",
        "amount": 600,
        "isPaid": false,
        "createdAt": "2025-03-04T11:00:00Z"
      }
    ]
  }
}
```

### POST /commissions/mark-paid/:commissionId
Mark commission as paid

**Request:**
```json
POST /commissions/mark-paid/comm-sal-002
```

**Response (200):**
```json
{
  "success": true,
  "message": "Commission marked as paid",
  "data": {
    "id": "comm-sal-002",
    "saleId": "sale-002",
    "agentId": "agent-001",
    "agentName": "John Doe",
    "amount": 600,
    "isPaid": true,
    "paidAt": "2025-03-04T16:10:00Z",
    "createdAt": "2025-03-04T11:00:00Z"
  }
}
```

---

## 12. ACCOUNTING - ACCOUNTS

### GET /accounting/accounts
List all accounts with pagination

**Request:**
```json
GET /accounting/accounts?page=1&limit=20&type=asset
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "acc-001",
        "code": "1000",
        "name": "Cash",
        "type": "asset",
        "balance": 500000,
        "createdAt": "2025-01-01T00:00:00Z"
      },
      {
        "id": "acc-002",
        "code": "1100",
        "name": "Accounts Receivable",
        "type": "asset",
        "balance": 75000,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### GET /accounting/accounts/:id
Get account by ID

**Request:**
```json
GET /accounting/accounts/acc-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "acc-001",
    "code": "1000",
    "name": "Cash",
    "type": "asset",
    "balance": 500000,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### POST /accounting/accounts
Create account

**Request:**
```json
{
  "code": "1200",
  "name": "Bank Account",
  "type": "asset"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "id": "acc-003",
    "code": "1200",
    "name": "Bank Account",
    "type": "asset",
    "balance": 0,
    "createdAt": "2025-03-04T16:15:00Z"
  }
}
```

### PUT /accounting/accounts/:id
Update account

**Request:**
```json
{
  "name": "Primary Bank Account"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account updated successfully",
  "data": {
    "id": "acc-001",
    "code": "1000",
    "name": "Primary Bank Account",
    "type": "asset",
    "balance": 500000,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

---

## 13. ACCOUNTING - JOURNAL ENTRIES

### GET /accounting/journal
List journal entries with pagination

**Request:**
```json
GET /accounting/journal?page=1&limit=20&startDate=2025-03-01&endDate=2025-03-04
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "je-001",
        "date": "2025-03-04",
        "description": "Sales invoice INV-2025-001",
        "entries": [
          {
            "accountId": "acc-001",
            "accountName": "Cash",
            "debit": 4500,
            "credit": 0
          },
          {
            "accountId": "acc-004",
            "accountName": "Sales Revenue",
            "debit": 0,
            "credit": 4500
          }
        ],
        "referenceId": "sale-001",
        "referenceType": "Sale",
        "createdAt": "2025-03-04T10:35:00Z",
        "createdBy": "user-001"
      }
    ],
    "total": 120,
    "page": 1,
    "limit": 20,
    "totalPages": 6
  }
}
```

### GET /accounting/journal/:id
Get journal entry by ID

**Request:**
```json
GET /accounting/journal/je-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "je-001",
    "date": "2025-03-04",
    "description": "Sales invoice INV-2025-001",
    "entries": [
      {
        "accountId": "acc-001",
        "accountName": "Cash",
        "debit": 4500,
        "credit": 0
      },
      {
        "accountId": "acc-004",
        "accountName": "Sales Revenue",
        "debit": 0,
        "credit": 4500
      }
    ],
    "referenceId": "sale-001",
    "referenceType": "Sale",
    "createdAt": "2025-03-04T10:35:00Z",
    "createdBy": "user-001"
  }
}
```

### POST /accounting/journal
Create journal entry

**Request:**
```json
{
  "date": "2025-03-04",
  "description": "Bank deposit",
  "entries": [
    {
      "accountId": "acc-001",
      "debit": 10000,
      "credit": 0
    },
    {
      "accountId": "acc-003",
      "debit": 0,
      "credit": 10000
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Journal entry created successfully",
  "data": {
    "id": "je-002",
    "date": "2025-03-04",
    "description": "Bank deposit",
    "entries": [
      {
        "accountId": "acc-001",
        "accountName": "Cash",
        "debit": 10000,
        "credit": 0
      },
      {
        "accountId": "acc-003",
        "accountName": "Bank Account",
        "debit": 0,
        "credit": 10000
      }
    ],
    "referenceId": "",
    "referenceType": "Manual",
    "createdAt": "2025-03-04T16:20:00Z",
    "createdBy": "user-001"
  }
}
```

---

## 14. USERS

### GET /users
List all users with pagination

**Request:**
```json
GET /users?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "user-001",
        "name": "John Doe",
        "email": "john@company.com",
        "role": "sales_agent",
        "isActive": true,
        "createdAt": "2025-01-01T08:00:00Z",
        "updatedAt": "2025-03-04T10:00:00Z"
      },
      {
        "id": "user-002",
        "name": "Jane Smith",
        "email": "jane@company.com",
        "role": "warehouse",
        "isActive": true,
        "createdAt": "2025-01-05T09:00:00Z",
        "updatedAt": "2025-03-01T14:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

### GET /users/:id
Get user by ID

**Request:**
```json
GET /users/user-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-001",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "sales_agent",
    "isActive": true,
    "createdAt": "2025-01-01T08:00:00Z",
    "updatedAt": "2025-03-04T10:00:00Z"
  }
}
```

### POST /users
Create new user

**Request:**
```json
{
  "name": "New User",
  "email": "newuser@company.com",
  "password": "TemporaryPassword123!",
  "role": "manager"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user-003",
    "name": "New User",
    "email": "newuser@company.com",
    "role": "manager",
    "isActive": true,
    "createdAt": "2025-03-04T16:25:00Z",
    "updatedAt": "2025-03-04T16:25:00Z"
  }
}
```

### PUT /users/:id
Update user

**Request:**
```json
{
  "name": "Updated Name",
  "role": "accountant"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user-001",
    "name": "Updated Name",
    "email": "john@company.com",
    "role": "accountant",
    "isActive": true,
    "createdAt": "2025-01-01T08:00:00Z",
    "updatedAt": "2025-03-04T16:30:00Z"
  }
}
```

### DELETE /users/:id
Delete user

**Request:**
```json
DELETE /users/user-001
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 15. USERS - ROLES & PERMISSIONS

### GET /users/roles
List all roles with permissions

**Request:**
```json
GET /users/roles?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "role-001",
        "name": "admin",
        "permissions": [
          {
            "module": "customers",
            "actions": ["view", "create", "edit", "delete"]
          },
          {
            "module": "sales",
            "actions": ["view", "create", "edit", "delete"]
          },
          {
            "module": "accounting",
            "actions": ["view", "create", "edit", "delete"]
          }
        ]
      }
    ],
    "total": 6,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### GET /users/roles/:id
Get role with permissions

**Request:**
```json
GET /users/roles/role-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "role-001",
    "name": "admin",
    "permissions": [
      {
        "module": "customers",
        "actions": ["view", "create", "edit", "delete"]
      },
      {
        "module": "sales",
        "actions": ["view", "create", "edit", "delete"]
      }
    ]
  }
}
```

### PUT /users/roles/:id
Update role permissions

**Request:**
```json
{
  "permissions": [
    {
      "module": "customers",
      "actions": ["view", "create"]
    },
    {
      "module": "sales",
      "actions": ["view"]
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "id": "role-002",
    "name": "sales_agent",
    "permissions": [
      {
        "module": "customers",
        "actions": ["view", "create"]
      },
      {
        "module": "sales",
        "actions": ["view"]
      }
    ]
  }
}
```

---

## 16. REPORTS

### GET /reports/sales
Generate sales report

**Request:**
```json
GET /reports/sales?startDate=2025-03-01&endDate=2025-03-04&agentId=agent-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reportType": "Sales",
    "period": "2025-03-01 to 2025-03-04",
    "filter": {
      "agentId": "agent-001"
    },
    "summary": {
      "totalSales": 150000,
      "totalItems": 500,
      "averageSaleValue": 3000,
      "topCustomer": "ABC Corporation"
    },
    "records": [
      {
        "invoiceNumber": "INV-2025-001",
        "date": "2025-03-04",
        "customer": "ABC Corporation",
        "agent": "John Doe",
        "amount": 4500,
        "status": "paid"
      }
    ]
  }
}
```

### GET /reports/commissions
Generate commissions report

**Request:**
```json
GET /reports/commissions?startDate=2025-03-01&endDate=2025-03-04&agentId=agent-001
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reportType": "Commissions",
    "period": "2025-03-01 to 2025-03-04",
    "filter": {
      "agentId": "agent-001"
    },
    "summary": {
      "totalCommissions": 12000,
      "totalPaid": 8000,
      "totalUnpaid": 4000
    },
    "agents": [
      {
        "agentId": "agent-001",
        "agentName": "John Doe",
        "totalCommission": 12000,
        "paid": 8000,
        "unpaid": 4000
      }
    ]
  }
}
```

### GET /reports/inventory
Generate inventory report

**Request:**
```json
GET /reports/inventory?category=electronics
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reportType": "Inventory",
    "generatedAt": "2025-03-04T16:35:00Z",
    "filter": {
      "category": "electronics"
    },
    "summary": {
      "totalProducts": 45,
      "totalStock": 12500,
      "totalValue": 625000,
      "lowStockItems": 8
    },
    "products": [
      {
        "productName": "Widget A",
        "quantity": 250,
        "costPrice": 50,
        "basePrice": 100,
        "currentValue": 12500,
        "status": "normal"
      }
    ]
  }
}
```

### GET /reports/customers
Generate customer report

**Request:**
```json
GET /reports/customers
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reportType": "Customers",
    "generatedAt": "2025-03-04T16:40:00Z",
    "summary": {
      "totalCustomers": 50,
      "totalCredit": 500000,
      "outstandingCredit": 75000,
      "activeCustomers": 48
    },
    "customers": [
      {
        "customerId": "cust-001",
        "name": "ABC Corporation",
        "creditLimit": 100000,
        "creditBalance": 45000,
        "outstandingPercentage": 45,
        "status": "good"
      }
    ]
  }
}
```

### GET /reports/production
Generate production report

**Request:**
```json
GET /reports/production?startDate=2025-03-01&endDate=2025-03-04
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reportType": "Production",
    "period": "2025-03-01 to 2025-03-04",
    "summary": {
      "totalProduced": 1250,
      "totalCompleted": 1200,
      "totalPending": 50,
      "materialsUsed": 15000
    },
    "productions": [
      {
        "productName": "Widget A",
        "quantityProduced": 100,
        "status": "completed",
        "date": "2025-03-03"
      }
    ]
  }
}
```

---

## Error Response Format

All errors follow this format:

**Response (4xx/5xx):**
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional details"
  }
}
```

## Common Error Codes

- `VALIDATION_ERROR` - Invalid request data
- `RESOURCE_NOT_FOUND` - Resource with given ID doesn't exist
- `UNAUTHORIZED` - Missing or invalid token
- `FORBIDDEN` - User doesn't have permission
- `CONFLICT` - Resource already exists
- `INTERNAL_ERROR` - Server error

---

## Authentication

All endpoints (except login & register) require the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Tokens are managed via:
- **POST /auth/login** - Get tokens
- **POST /auth/refresh** - Refresh access token
- **POST /auth/logout** - Logout
