# Supplier Order Management - API Endpoints Documentation

## Base URL
```
http://localhost:3000/api
```

---

## 1. SUPPLIER ENDPOINTS

### 1.1 Get All Suppliers
**GET** `/suppliers`

**Query Parameters:**
- `search` (optional): Search by name/email/phone
- `limit` (optional): Number of results (default: 10)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id": "sup_123",
      "name": "ABC Suppliers Ltd",
      "email": "contact@abcsuppliers.com",
      "phone": "+1-234-567-8900",
      "address": "123 Industrial Ave, City",
      "paymentTerms": "Net 30",
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "message": "Suppliers retrieved successfully"
}
```

---

### 1.2 Get Supplier by ID
**GET** `/suppliers/{id}`

**Response:**
```json
{
  "status": 200,
  "data": {
    "id": "sup_123",
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

**Response:**
```json
{
  "status": 201,
  "data": {
    "id": "sup_123",
    "name": "ABC Suppliers Ltd",
    "email": "contact@abcsuppliers.com",
    "phone": "+1-234-567-8900",
    "address": "123 Industrial Ave, City",
    "paymentTerms": "Net 30",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  },
  "message": "Supplier created"
}
```

---

### 1.4 Update Supplier
**PATCH** `/suppliers/{id}`

**Request Body:**
```json
{
  "name": "ABC Suppliers Ltd",
  "email": "newemail@abcsuppliers.com",
  "phone": "+1-234-567-8900",
  "address": "456 New Industrial St",
  "paymentTerms": "Net 45",
  "isActive": true
}
```

**Response:**
```json
{
  "status": 200,
  "data": {
    "id": "sup_123",
    "name": "ABC Suppliers Ltd",
    "email": "newemail@abcsuppliers.com",
    "phone": "+1-234-567-8900",
    "address": "456 New Industrial St",
    "paymentTerms": "Net 45",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T14:45:00Z"
  }
}
```

---

## 2. RAW MATERIALS ENDPOINTS

### 2.1 Get Raw Materials
**GET** `/raw-materials`

**Query Parameters:**
- `search` (optional): Search by name
- `supplierId` (optional): Filter by supplier
- `limit` (optional): Number of results
- `page` (optional): Page number

**Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id": "rm_001",
      "name": "Steel Sheets",
      "unit": "kg",
      "currentCost": 45.50,
      "minimumOrderQty": 100,
      "leadTimeDays": 7,
      "supplierId": "sup_123",
      "createdAt": "2025-01-10T08:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": "rm_002",
      "name": "Aluminum Wire",
      "unit": "m",
      "currentCost": 2.30,
      "minimumOrderQty": 500,
      "leadTimeDays": 5,
      "supplierId": "sup_123",
      "createdAt": "2025-01-10T08:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
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
  "currentCost": 45.50,
  "minimumOrderQty": 100,
  "leadTimeDays": 7,
  "supplierId": "sup_123"
}
```

**Response:**
```json
{
  "status": 201,
  "data": {
    "id": "rm_001",
    "name": "Steel Sheets",
    "unit": "kg",
    "currentCost": 45.50,
    "minimumOrderQty": 100,
    "leadTimeDays": 7,
    "supplierId": "sup_123",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

---

## 3. PURCHASE ORDERS ENDPOINTS

### 3.1 Get All Purchase Orders
**GET** `/supplier-orders`

**Query Parameters:**
- `status` (optional): Filter by status (draft, sent, confirmed, partial_received, received, invoiced, paid, cancelled)
- `supplierId` (optional): Filter by supplier
- `page` (optional): Page number
- `limit` (optional): Results per page

**Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id": "po_001",
      "supplierId": "sup_123",
      "supplierName": "ABC Suppliers Ltd",
      "supplierEmail": "contact@abcsuppliers.com",
      "supplierPhone": "+1-234-567-8900",
      "paymentTerms": "Net 30",
      "status": "sent",
      "items": [
        {
          "id": "poi_001",
          "rawMaterialId": "rm_001",
          "rawMaterialName": "Steel Sheets",
          "quantity": 500,
          "unit": "kg",
          "unitPrice": 45.50,
          "minimumOrder": 100,
          "leadTime": 7,
          "receivedQty": 0
        }
      ],
      "deliveryDate": "2025-02-01",
      "notes": "Standard delivery",
      "proofOfPaymentUrl": null,
      "invoiceUrl": null,
      "totalAmount": 22750.00,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 3.2 Get Purchase Order by ID
**GET** `/supplier-orders/{id}`

**Response:**
```json
{
  "status": 200,
  "data": {
    "id": "po_001",
    "supplierId": "sup_123",
    "supplierName": "ABC Suppliers Ltd",
    "supplierEmail": "contact@abcsuppliers.com",
    "supplierPhone": "+1-234-567-8900",
    "paymentTerms": "Net 30",
    "status": "sent",
    "items": [
      {
        "id": "poi_001",
        "rawMaterialId": "rm_001",
        "rawMaterialName": "Steel Sheets",
        "quantity": 500,
        "unit": "kg",
        "unitPrice": 45.50,
        "minimumOrder": 100,
        "leadTime": 7,
        "receivedQty": 0
      },
      {
        "id": "poi_002",
        "rawMaterialId": "rm_002",
        "rawMaterialName": "Aluminum Wire",
        "quantity": 1000,
        "unit": "m",
        "unitPrice": 2.30,
        "minimumOrder": 500,
        "leadTime": 5,
        "receivedQty": 0
      }
    ],
    "deliveryDate": "2025-02-01",
    "notes": "Standard delivery, expedite if possible",
    "proofOfPaymentUrl": null,
    "invoiceUrl": null,
    "totalAmount": 25050.00,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### 3.3 Create Purchase Order
**POST** `/supplier-orders`

**Request Body:**
```json
{
  "supplierId": "sup_123",
  "deliveryDate": "2025-02-01",
  "notes": "Expedite if possible",
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

**Response:**
```json
{
  "status": 201,
  "data": {
    "id": "po_001",
    "supplierId": "sup_123",
    "supplierName": "ABC Suppliers Ltd",
    "supplierEmail": "contact@abcsuppliers.com",
    "supplierPhone": "+1-234-567-8900",
    "paymentTerms": "Net 30",
    "status": "draft",
    "items": [
      {
        "id": "poi_001",
        "rawMaterialId": "rm_001",
        "rawMaterialName": "Steel Sheets",
        "quantity": 500,
        "unit": "kg",
        "unitPrice": 45.50,
        "minimumOrder": 100,
        "leadTime": 7,
        "receivedQty": 0
      },
      {
        "id": "poi_002",
        "rawMaterialId": "rm_002",
        "rawMaterialName": "Aluminum Wire",
        "quantity": 1000,
        "unit": "m",
        "unitPrice": 2.30,
        "minimumOrder": 500,
        "leadTime": 5,
        "receivedQty": 0
      }
    ],
    "deliveryDate": "2025-02-01",
    "notes": "Expedite if possible",
    "proofOfPaymentUrl": null,
    "invoiceUrl": null,
    "totalAmount": 25050.00,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  },
  "message": "Purchase order created"
}
```

---

### 3.4 Update Purchase Order Status
**PATCH** `/supplier-orders/{id}`

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Transitions:**
- `draft` → `sent`, `cancelled`
- `sent` → `confirmed`, `cancelled`
- `confirmed` → `partial_received`, `cancelled`
- `partial_received` → `received`, `cancelled`
- `received` → `invoiced`, `cancelled`
- `invoiced` → `paid`, `cancelled`

**Response:**
```json
{
  "status": 200,
  "data": {
    "id": "po_001",
    "supplierId": "sup_123",
    "status": "confirmed",
    "items": [...],
    "updatedAt": "2025-01-15T11:00:00Z"
  },
  "message": "Status updated to confirmed"
}
```

---

### 3.5 Send Order Email to Supplier
**POST** `/supplier-orders/{id}/send-email`

**Request Body:** (empty)

**Response:**
```json
{
  "status": 200,
  "data": {
    "id": "po_001",
    "status": "sent",
    "emailSentAt": "2025-01-15T10:35:00Z",
    "recipientEmail": "contact@abcsuppliers.com"
  },
  "message": "Purchase order sent to supplier"
}
```

---

### 3.6 Record Receiving
**POST** `/supplier-orders/{id}/receiving`

**Request Body:**
```json
{
  "items": {
    "poi_001": 250,
    "poi_002": 1000
  }
}
```

**Response:**
```json
{
  "status": 200,
  "data": {
    "id": "po_001",
    "status": "partial_received",
    "items": [
      {
        "id": "poi_001",
        "rawMaterialName": "Steel Sheets",
        "quantity": 500,
        "receivedQty": 250
      },
      {
        "id": "poi_002",
        "rawMaterialName": "Aluminum Wire",
        "quantity": 1000,
        "receivedQty": 1000
      }
    ],
    "lastReceivedAt": "2025-01-15T14:30:00Z"
  },
  "message": "Receiving recorded"
}
```

---

### 3.7 Upload Proof of Payment
**POST** `/supplier-orders/{id}/proof-of-payment`

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required): PDF or image file (max 10MB)

**Response:**
```json
{
  "status": 200,
  "data": {
    "id": "po_001",
    "proofOfPaymentUrl": "https://storage.example.com/payments/po_001_proof.pdf",
    "uploadedAt": "2025-01-15T15:00:00Z"
  },
  "message": "Proof of payment uploaded successfully"
}
```

---

### 3.8 Upload Invoice
**POST** `/supplier-orders/{id}/invoice`

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required): PDF or image file (max 10MB)

**Response:**
```json
{
  "status": 200,
  "data": {
    "id": "po_001",
    "invoiceUrl": "https://storage.example.com/invoices/po_001_invoice.pdf",
    "uploadedAt": "2025-01-15T15:05:00Z"
  },
  "message": "Invoice uploaded successfully"
}
```

---

### 3.9 Delete Purchase Order
**DELETE** `/supplier-orders/{id}`

**Response:**
```json
{
  "status": 200,
  "message": "Purchase order deleted successfully"
}
```

---

## 4. ERROR RESPONSES

### 4.1 Validation Error
**Status Code:** 400

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "supplierId",
      "message": "Supplier ID is required"
    },
    {
      "field": "items",
      "message": "At least one item is required"
    }
  ]
}
```

---

### 4.2 Not Found Error
**Status Code:** 404

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Purchase order not found"
}
```

---

### 4.3 Conflict Error (Invalid Status Transition)
**Status Code:** 409

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Cannot transition from 'paid' status to 'invoiced'"
}
```

---

### 4.4 Server Error
**Status Code:** 500

```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "Failed to process request"
}
```

---

## 5. WORKFLOW EXAMPLE

### Complete Purchase Order Flow

1. **Create Supplier** → POST `/suppliers`
2. **Create Raw Materials** → POST `/raw-materials` (for each material)
3. **Create Purchase Order** → POST `/supplier-orders`
   - Status: `draft`
4. **Send to Supplier** → POST `/supplier-orders/{id}/send-email`
   - Status: `sent`
5. **Supplier Confirms** → PATCH `/supplier-orders/{id}`
   - Status: `confirmed`
6. **Record Partial Delivery** → POST `/supplier-orders/{id}/receiving`
   - Status: `partial_received`
7. **Record Complete Delivery** → POST `/supplier-orders/{id}/receiving`
   - Status: `received`
8. **Upload Invoice** → POST `/supplier-orders/{id}/invoice`
   - Status remains: `received`
9. **Change to Invoiced** → PATCH `/supplier-orders/{id}`
   - Status: `invoiced`
10. **Upload Proof of Payment** → POST `/supplier-orders/{id}/proof-of-payment`
11. **Mark as Paid** → PATCH `/supplier-orders/{id}`
    - Status: `paid`

---

## 6. AUTHENTICATION
All endpoints require:
- **Header:** `Authorization: Bearer {accessToken}`
- **Header:** `Content-Type: application/json` (except file uploads)

---

## 7. RATE LIMITING
- 100 requests per minute per user
- File uploads: 10 requests per minute per user

---

## 8. NOTES
- Email notifications are sent automatically when order status changes to `sent` or `invoiced`
- Stock levels are updated automatically when receiving is recorded
- All timestamps are in ISO 8601 format (UTC)
- File uploads are stored securely with automatic expiration after 1 year
