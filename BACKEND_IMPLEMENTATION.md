# Backend Implementation Guide - Supplier Orders API

## Quick Start for Backend Developers

This guide provides all necessary information to implement the backend APIs for the Supplier Order Management System.

---

## 📋 Prerequisites

- Database setup with tables for: Suppliers, RawMaterials, PurchaseOrders, PurchaseOrderItems
- Authentication middleware (JWT/Bearer tokens)
- File storage service (S3, local storage, or similar)
- Email service (SendGrid, AWS SES, etc.)
- Transaction/ACID support for status transitions

---

## 🗄️ Database Schema

### suppliers table
```sql
CREATE TABLE suppliers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  payment_terms VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### raw_materials table
```sql
CREATE TABLE raw_materials (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  current_cost DECIMAL(10, 2),
  minimum_order_qty INT,
  lead_time_days INT,
  supplier_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
```

### purchase_orders table
```sql
CREATE TABLE purchase_orders (
  id VARCHAR(36) PRIMARY KEY,
  supplier_id VARCHAR(36) NOT NULL,
  status ENUM('draft','sent','confirmed','partial_received','received','invoiced','paid','cancelled') DEFAULT 'draft',
  delivery_date DATE,
  notes TEXT,
  proof_of_payment_url VARCHAR(500),
  invoice_url VARCHAR(500),
  total_amount DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  INDEX idx_status (status),
  INDEX idx_supplier (supplier_id)
);
```

### purchase_order_items table
```sql
CREATE TABLE purchase_order_items (
  id VARCHAR(36) PRIMARY KEY,
  purchase_order_id VARCHAR(36) NOT NULL,
  raw_material_id VARCHAR(36) NOT NULL,
  quantity DECIMAL(12, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  received_qty DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id)
);
```

---

## 🔧 Implementation Checklist

### Phase 1: Core Endpoints
- [ ] POST `/suppliers` - Create supplier
- [ ] GET `/suppliers` - List suppliers with search
- [ ] GET `/suppliers/{id}` - Get supplier details
- [ ] PATCH `/suppliers/{id}` - Update supplier

### Phase 2: Raw Materials
- [ ] POST `/raw-materials` - Create material
- [ ] GET `/raw-materials` - List materials with filtering

### Phase 3: Purchase Orders CRUD
- [ ] POST `/supplier-orders` - Create purchase order
- [ ] GET `/supplier-orders` - List with pagination & filtering
- [ ] GET `/supplier-orders/{id}` - Get order details
- [ ] DELETE `/supplier-orders/{id}` - Delete order

### Phase 4: Status Management
- [ ] PATCH `/supplier-orders/{id}` - Update status with transitions
- [ ] Validate status transition logic
- [ ] Log all status changes

### Phase 5: Receiving Workflow
- [ ] POST `/supplier-orders/{id}/receiving` - Record deliveries
- [ ] Update stock levels automatically
- [ ] Log inventory movements

### Phase 6: File Management
- [ ] POST `/supplier-orders/{id}/proof-of-payment` - Upload payment proof
- [ ] POST `/supplier-orders/{id}/invoice` - Upload invoice
- [ ] Validate file types and sizes
- [ ] Return secure URLs

### Phase 7: Email Integration
- [ ] POST `/supplier-orders/{id}/send-email` - Send order to supplier
- [ ] Generate email from order data
- [ ] Update status to "sent"

### Phase 8: Testing & Hardening
- [ ] Unit tests for all endpoints
- [ ] Integration tests for workflows
- [ ] Error handling for edge cases
- [ ] Performance optimization

---

## 💻 Implementation Examples

### 1. Create Purchase Order

```python
# Example: FastAPI/Python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/supplier-orders")
async def create_purchase_order(
    order_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new purchase order"""
    
    # Validate supplier exists
    supplier = db.query(Supplier).filter(
        Supplier.id == order_data["supplierId"]
    ).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Validate items
    if not order_data.get("items") or len(order_data["items"]) == 0:
        raise HTTPException(status_code=400, detail="At least one item required")
    
    # Create order
    po = PurchaseOrder(
        id=str(uuid.uuid4()),
        supplier_id=order_data["supplierId"],
        delivery_date=order_data["deliveryDate"],
        notes=order_data.get("notes"),
        status="draft",
        total_amount=0,
        created_at=datetime.utcnow()
    )
    
    total = 0
    for item_data in order_data["items"]:
        # Validate material exists
        material = db.query(RawMaterial).filter(
            RawMaterial.id == item_data["rawMaterialId"]
        ).first()
        if not material:
            raise HTTPException(status_code=404, detail=f"Material not found: {item_data['rawMaterialId']}")
        
        line_total = item_data["quantity"] * item_data["unitPrice"]
        total += line_total
        
        item = PurchaseOrderItem(
            id=str(uuid.uuid4()),
            purchase_order_id=po.id,
            raw_material_id=item_data["rawMaterialId"],
            quantity=item_data["quantity"],
            unit_price=item_data["unitPrice"],
            received_qty=0
        )
        db.add(item)
    
    po.total_amount = total
    db.add(po)
    db.commit()
    db.refresh(po)
    
    return {
        "status": 201,
        "data": serialize_po(po),
        "message": "Purchase order created"
    }
```

### 2. Update Status with Validation

```python
@router.patch("/supplier-orders/{order_id}")
async def update_purchase_order_status(
    order_id: str,
    update_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update purchase order status with transition validation"""
    
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == order_id
    ).first()
    
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    new_status = update_data.get("status")
    
    # Define valid transitions
    valid_transitions = {
        "draft": ["sent", "cancelled"],
        "sent": ["confirmed", "cancelled"],
        "confirmed": ["partial_received", "cancelled"],
        "partial_received": ["received", "cancelled"],
        "received": ["invoiced", "cancelled"],
        "invoiced": ["paid", "cancelled"],
        "paid": [],
        "cancelled": []
    }
    
    current_status = po.status
    if new_status not in valid_transitions.get(current_status, []):
        raise HTTPException(
            status_code=409,
            detail=f"Cannot transition from '{current_status}' to '{new_status}'"
        )
    
    # Log transition
    log_status_change(po.id, current_status, new_status, current_user.id, db)
    
    # Update status
    po.status = new_status
    po.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(po)
    
    return {
        "status": 200,
        "data": serialize_po(po),
        "message": f"Status updated to {new_status}"
    }
```

### 3. Record Receiving

```python
@router.post("/supplier-orders/{order_id}/receiving")
async def record_receiving(
    order_id: str,
    receiving_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Record receiving of purchase order items"""
    
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == order_id
    ).first()
    
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    if po.status not in ["sent", "confirmed", "partial_received"]:
        raise HTTPException(status_code=409, detail="Cannot receive in current status")
    
    items_data = receiving_data.get("items", {})
    all_received = True
    
    for item in po.items:
        received_qty = items_data.get(item.id, 0)
        
        # Validate quantity
        if received_qty > item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Received quantity exceeds ordered quantity for item {item.id}"
            )
        
        item.received_qty = received_qty
        
        # Update inventory
        if received_qty > 0:
            update_inventory(item.raw_material_id, received_qty, "supplier_order", order_id, db)
        
        # Check if fully received
        if item.received_qty < item.quantity:
            all_received = False
    
    # Update PO status
    if all_received:
        po.status = "received"
    else:
        po.status = "partial_received"
    
    po.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(po)
    
    # Log receiving
    log_activity(f"Receiving recorded for PO {order_id}", current_user.id, db)
    
    return {
        "status": 200,
        "data": serialize_po(po),
        "message": "Receiving recorded"
    }
```

### 4. File Upload Handling

```python
@router.post("/supplier-orders/{order_id}/proof-of-payment")
async def upload_proof_of_payment(
    order_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Upload proof of payment for purchase order"""
    
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Validate file size (max 10MB)
    file_size = len(await file.read())
    await file.seek(0)
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")
    
    # Save file
    file_path = f"payments/{order_id}_{datetime.utcnow().timestamp()}.{file.filename.split('.')[-1]}"
    file_url = await save_to_storage(file, file_path)  # Implement your storage logic
    
    # Update PO
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == order_id
    ).first()
    
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    po.proof_of_payment_url = file_url
    po.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "status": 200,
        "data": {
            "id": order_id,
            "proofOfPaymentUrl": file_url,
            "uploadedAt": datetime.utcnow().isoformat()
        },
        "message": "Proof of payment uploaded"
    }
```

### 5. Send Email to Supplier

```python
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from jinja2 import Template

@router.post("/supplier-orders/{order_id}/send-email")
async def send_order_email(
    order_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Send purchase order email to supplier"""
    
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == order_id
    ).first()
    
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    if po.status != "draft":
        raise HTTPException(status_code=409, detail="Can only send draft orders")
    
    # Get supplier details
    supplier = po.supplier
    
    # Generate HTML email
    email_html = generate_po_email(po, supplier)
    
    # Send email
    try:
        send_email_via_service(
            to_email=supplier.email,
            subject=f"Purchase Order #{po.id[:8]} from Factory ERP",
            html_content=email_html,
            attachments=[]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
    
    # Update status
    po.status = "sent"
    po.updated_at = datetime.utcnow()
    db.commit()
    
    # Log activity
    log_activity(f"PO sent to supplier {supplier.name}", current_user.id, db)
    
    return {
        "status": 200,
        "data": {
            "id": order_id,
            "status": "sent",
            "emailSentAt": datetime.utcnow().isoformat(),
            "recipientEmail": supplier.email
        },
        "message": "Purchase order sent to supplier"
    }

def generate_po_email(po, supplier):
    """Generate HTML email for purchase order"""
    html_template = """
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background: #f5f2ee; padding: 20px;">
                <div style="background: white; padding: 30px; border-top: 3px solid #B5611F;">
                    
                    <h1 style="color: #B5611F; margin: 0 0 10px;">Purchase Order Request</h1>
                    <p style="color: #999; margin: 0 0 30px; font-size: 12px;">Generated on {{ date }}</p>
                    
                    <h2 style="font-size: 14px; color: #666; margin: 30px 0 10px;">To:</h2>
                    <p style="margin: 0;"><strong>{{ supplier_name }}</strong></p>
                    <p style="margin: 0; font-size: 13px;">{{ supplier_email }}</p>
                    <p style="margin: 0; font-size: 13px;">{{ supplier_phone }}</p>
                    
                    <div style="background: #f9f7f4; padding: 15px; margin: 30px 0; border: 1px solid #e0e0e0;">
                        <p style="margin: 0 0 10px;"><strong>Expected Delivery:</strong> {{ delivery_date }}</p>
                        <p style="margin: 0;"><strong>Payment Terms:</strong> {{ payment_terms }}</p>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                        <thead>
                            <tr style="background: #f0ede8;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #999;">Material</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #999;">Qty</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #999;">Unit Price</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #999;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {% for item in items %}
                            <tr style="border-bottom: 1px solid #e0e0e0;">
                                <td style="padding: 10px;">{{ item.material_name }}</td>
                                <td style="padding: 10px; text-align: right;">{{ item.quantity }}</td>
                                <td style="padding: 10px; text-align: right;">${{ item.unit_price }}</td>
                                <td style="padding: 10px; text-align: right;">${{ item.total }}</td>
                            </tr>
                            {% endfor %}
                        </tbody>
                    </table>
                    
                    <div style="background: #f9f7f4; padding: 15px; border-top: 2px solid #B5611F;">
                        <p style="margin: 0; text-align: right; font-size: 18px; color: #B5611F;">
                            <strong>Total: ${{ total }}</strong>
                        </p>
                    </div>
                    
                    <p style="margin: 30px 0 0; color: #999; font-size: 12px; font-style: italic;">
                        This is an automated purchase order. Please confirm receipt and expected delivery date.
                    </p>
                    
                </div>
            </div>
        </body>
    </html>
    """
    
    t = Template(html_template)
    return t.render(
        date=datetime.now().strftime("%b %d, %Y"),
        supplier_name=supplier.name,
        supplier_email=supplier.email,
        supplier_phone=supplier.phone,
        delivery_date=po.delivery_date.strftime("%b %d, %Y"),
        payment_terms=supplier.payment_terms or "Net 30",
        items=[
            {
                "material_name": item.material.name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total": item.quantity * item.unit_price
            }
            for item in po.items
        ],
        total=po.total_amount
    )
```

---

## ✅ Validation Rules

### Input Validation

```python
validator_rules = {
    "supplierId": ["required", "exists:suppliers"],
    "deliveryDate": ["required", "date", "after_today"],
    "items": ["required", "array", "min:1"],
    "items.*.rawMaterialId": ["required", "exists:raw_materials"],
    "items.*.quantity": ["required", "numeric", "min:1"],
    "items.*.unitPrice": ["required", "numeric", "min:0"],
}
```

### Status Transition Validation

```python
valid_transitions = {
    "draft": ["sent", "cancelled"],
    "sent": ["confirmed", "cancelled"],
    "confirmed": ["partial_received", "cancelled"],
    "partial_received": ["received", "cancelled"],
    "received": ["invoiced", "cancelled"],
    "invoiced": ["paid", "cancelled"],
    "paid": [],
    "cancelled": []
}
```

---

## 🔒 Security Measures

### Required for Production

1. **Authentication**
   - Verify JWT token on all endpoints
   - Extract user ID from token claims
   - 401 for invalid/missing tokens

2. **Authorization**
   - Only authorized roles can create orders
   - Only managers/admins can approve orders
   - Users can only manage orders they created (or adjust permission)

3. **Input Sanitization**
   - Escape all string inputs
   - Validate data types
   - Limit string lengths
   - Validate date formats

4. **File Upload Security**
   - Validate file types (whitelist)
   - Check file size limits
   - Scan for malware
   - Store outside web root
   - Generate random filenames

5. **Rate Limiting**
   - 100 requests/minute/user for normal endpoints
   - 10 requests/minute/user for file uploads
   - 1000 requests/minute for GET endpoints

6. **Logging & Auditing**
   - Log all status changes
   - Log all file uploads
   - Log failed attempts
   - Keep 90-day audit trail

---

## 📊 Error Handling

```python
error_responses = {
    400: "Bad Request - Invalid input",
    401: "Unauthorized - Invalid token",
    403: "Forbidden - Insufficient permissions",
    404: "Not Found - Resource doesn't exist",
    409: "Conflict - Invalid status transition",
    413: "Payload Too Large - File exceeds limit",
    415: "Unsupported Media Type - Invalid file type",
    429: "Too Many Requests - Rate limit exceeded",
    500: "Internal Server Error - Contact support"
}
```

---

## 🧪 Testing Checklist

- [ ] POST `/supplier-orders` creates order in draft
- [ ] PATCH with invalid transition returns 409
- [ ] File upload validates size and type
- [ ] Status email sends correctly to supplier
- [ ] Receiving updates inventory
- [ ] Concurrent requests don't cause race conditions
- [ ] All error cases return correct status codes
- [ ] Authorization prevents unauthorized access
- [ ] Pagination works correctly
- [ ] Search filters work on all endpoints

---

## 🚀 Deployment Notes

1. Run database migrations for new tables
2. Set up file storage backend
3. Configure email service
4. Set up logging and monitoring
5. Test all endpoints before going live
6. Set up database backups
7. Configure API rate limiting on load balancer

---

**This implementation guide provides everything needed to build a production-ready backend**

For frontend implementation details, see [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
