# Supplier Order Management System - Implementation Guide

## Overview
The Supplier Order Management System allows factory administrators to manage the complete procurement workflow from creating purchase orders to tracking deliveries and payments.

## Features

### 1. **Supplier Management**
- View all suppliers with search functionality
- Add new suppliers with contact information and payment terms
- Update supplier details
- Track supplier performance

### 2. **Purchase Order Creation**
- Create new purchase orders with split-view interface
- **Left Panel:** Supplier selection, material selection, quantity/price input
- **Right Panel:** Real-time email preview sent to supplier
- Set expected delivery dates
- Add special notes for delivery instructions
- Automatic validation for minimum order quantities

### 3. **Order Status Management**
Complete order lifecycle tracking with 8 status states:
- **Draft** - Order being prepared
- **Sent** - Order emailed to supplier
- **Confirmed** - Supplier confirmed the order
- **Partial Received** - Partial delivery received
- **Received** - Complete delivery received
- **Invoiced** - Supplier's invoice received
- **Paid** - Payment completed
- **Cancelled** - Order cancelled

### 4. **Payment & Documentation**
- Upload proof of payment (PDF/Image)
- Upload supplier invoice
- Track payment status
- Automatic document storage with URLs

### 5. **Receiving & Inventory**
- Record partial or complete deliveries
- Track received quantities per material
- Automatically update raw material stock
- Monitor discrepancies

---

## Page Routes

### Main Pages
```
/suppliers/orders                    # Purchase Orders List
/suppliers/orders/new                # Create New Purchase Order
/suppliers/orders/[id]               # Order Details & Management
```

### Related Pages
```
/suppliers                           # Suppliers List (requires backend)
/suppliers/new                       # Add New Supplier (requires backend)
/suppliers/[id]                      # Supplier Details (requires backend)
/inventory/raw-materials             # Raw Materials List (requires backend)
/inventory/raw-materials/new         # Add Raw Material (requires backend)
```

---

## How to Use

### Creating a Purchase Order

#### Step 1: Navigate to New Order
- Click "New Order" button on the Purchase Orders list page
- Or navigate to `/suppliers/orders/new`

#### Step 2: Select Supplier
1. Click the supplier search field in the left panel
2. Type supplier name or email
3. Select supplier from dropdown
4. Supplier details appear in the right panel (email preview updates)

#### Step 3: Add Materials
1. Search for materials in the "Add Material" field (only visible after supplier selection)
2. Click material from dropdown to add it
3. Material appears in the materials list

#### Step 4: Set Quantities & Prices
1. Adjust quantity for each material
2. Verify minimum order quantities (shows warning if below minimum)
3. Adjust unit price if needed
4. Order total updates automatically in email preview

#### Step 5: Set Delivery Details
1. Select expected delivery date
2. Add special notes (storage, handling, etc.)
3. Email preview updates in real-time with all information

#### Step 6: Submit Order
1. Verify all information in email preview
2. Click "Create Purchase Order"
3. Order is created in "Draft" status

---

### Managing an Order

#### View Order Details
1. Go to Orders list page `/suppliers/orders`
2. Click order or row chevron icon
3. View complete order information with status and timeline

#### Update Order Status
1. On order detail page, click "Update Status" button
2. Select valid status transition
3. Status updates automatically (moves to next stage in workflow)

#### Send Order to Supplier
1. Click "Send to Supplier" button (only available in Draft status)
2. Email is automatically sent to supplier's email
3. Status changes to "Sent"

#### Record Product Delivery
1. Click "Record Receiving" button (available in Sent/Confirmed/Partial Received states)
2. Enter quantities received for each material
3. Click "Record"
4. Status updates automatically:
   - Partial delivery → "Partial Received"
   - Complete delivery → "Received"

#### Upload Payment Proof
1. Scroll to "Payment" section on right sidebar
2. Click "Upload Proof" button
3. Select PDF or image file (max 10MB)
4. File uploads and becomes visible/downloadable

#### Upload Supplier Invoice
1. Scroll to "Invoice" section on right sidebar
2. Click "Upload Invoice" button
3. Select PDF or image file (max 10MB)
4. File uploads and becomes visible/downloadable

#### Mark as Paid
1. After invoice uploaded, update status to "Invoiced"
2. Then update status to "Paid"

---

## Email Preview Feature

The right-side email preview shows exactly what will be sent to the supplier:

### Includes:
- ✓ Generated date
- ✓ Supplier name, email, phone
- ✓ Expected delivery date
- ✓ Complete line-by-line material details:
  - Material name
  - Quantity and unit
  - Unit price
  - Total per material
- ✓ Order grand total
- ✓ Professional formatting

### Benefits:
- Verify accuracy before sending
- No need to check actual sent emails
- Includes all necessary procurement information

---

## Status Transition Diagram

```
Draft
  ↓
  ├─→ Sent (via "Send to Supplier")
  └─→ Cancelled
  
Sent
  ├─→ Confirmed (supplier confirms)
  └─→ Cancelled

Confirmed
  ├─→ Partial Received (partial delivery recorded)
  └─→ Cancelled

Partial Received
  ├─→ Received (final delivery recorded)
  └─→ Cancelled

Received
  ├─→ Invoiced (invoice uploaded/approved)
  └─→ Cancelled

Invoiced
  ├─→ Paid (payment recorded)
  └─→ Cancelled

Paid
  └─→ (Final state - no transitions)

Cancelled
  └─→ (Final state - no transitions)
```

---

## Data Input Validation

### Supplier Selection
- ✓ Required field
- ✓ Must select from available suppliers
- ✓ Search supports name, email, phone

### Delivery Date
- ✓ Required field
- ✓ Must be a valid date
- ✓ Generally should be in future

### Materials
- ✓ At least one material required
- ✓ Quantity must be ≥ 1
- ✓ Unit price must be ≥ 0
- ✓ Warning if quantity below minimum order quantity

### Notes (Optional)
- ✓ Text field for special instructions
- ✓ Appears in email sent to supplier

---

## Inventory Integration

When receiving is recorded:
1. Raw material stock levels automatically update
2. Stock movements are logged
3. Low stock alerts trigger if below minimum
4. Production scheduling can utilize updated inventory

---

## Payment Terms Configuration

Payment terms are stored with each supplier and displayed in:
- Order creation form (supplier info card)
- Order detail page (supplier section)
- Email sent to supplier

Common terms:
- Net 30 (payment due 30 days after invoice)
- Net 45 (payment due 45 days after invoice)
- Net 60 (payment due 60 days after invoice)
- 2/10 Net 30 (2% discount if paid within 10 days)
- COD (Cash on Delivery)

---

## Reporting & Analytics

### Available Reports (implement via dashboard)

1. **Purchase Order Summary**
   - Total orders this period
   - Total spending by supplier
   - Average delivery time
   - Order fulfillment rate

2. **Supplier Performance**
   - On-time delivery percentage
   - Quality issues/returns
   - Average lead time
   - Payment reliability

3. **Inventory Status**
   - Stock levels of raw materials
   - Materials below minimum threshold
   - Days of supply on hand
   - Reorder recommendations

4. **Cost Analysis**
   - Cost per unit by supplier
   - Price trends over time
   - Volume discounts achieved
   - Savings opportunities

---

## Best Practices

### For Procurement Managers:

1. **Review Email Preview Before Sending**
   - Always check the right-side email preview
   - Verify all quantities, prices, and dates
   - Ensure special notes are formatted correctly

2. **Set Realistic Delivery Dates**
   - Consider supplier lead times
   - Add buffer for unexpected delays
   - Align with production schedules

3. **Maintain Complete Documentation**
   - Always upload proofs of payment
   - Store supplier invoices immediately upon receipt
   - Keep delivery notes and photos for discrepancies

4. **Track Supplier Performance**
   - Monitor on-time delivery rates
   - Document quality issues
   - Maintain communication history

5. **Minimize Minimum Order Violations**
   - Review minimum order quantities during order creation
   - If you need less, consider consolidating with other orders
   - Work with suppliers on MOQ terms during negotiations

### For Finance/Accounting:

1. **Payment Reconciliation**
   - Use proof of payment upload for audit trail
   - Match payments to invoices automatically
   - Maintain organized file structure

2. **Expense Tracking**
   - Automatically tie expenses to production
   - Track purchase prices for variance analysis
   - Look for cost saving opportunities

3. **Cash Flow Planning**
   - Monitor payment terms
   - Schedule payments based on due dates
   - Maintain supplier relationships

---

## Troubleshooting

### Problem: Cannot see materials to add
**Solution:** Materials only appear after selecting a supplier. Select supplier first, then search for materials.

### Problem: Minimum order quantity warning
**Solution:** Increase the order quantity to meet supplier's minimum requirements, or contact supplier to negotiate lower MOQ.

### Problem: Status won't change
**Solution:** Check if current status allows transition to the new status. Some transitions are blocked (e.g., can't go from Paid back to Invoiced).

### Problem: Email not sending to supplier
**Solution:** Verify supplier email is correct and valid. Check backend logs for email service errors. May have daily email limit.

### Problem: File upload failing
**Solution:** Ensure file is under 10MB. Allowed formats: PDF, JPG, PNG. Check browser console for specific error.

---

## Future Enhancements

Planned features for future versions:

1. **Automated Reordering**
   - Automatic PO generation when stock below threshold
   - Scheduled recurring orders

2. **Supplier Portal**
   - Supplier self-service order confirmation
   - Real-time delivery status updates
   - Automated payment invoicing

3. **Advanced Analytics**
   - Predictive delivery forecasting
   - Supplier performance scoring
   - Cost optimization recommendations

4. **Integration**
   - Accounting system integration (automatic GL posting)
   - EDI/API for large suppliers
   - Shipping carrier integration

5. **Mobile App**
   - Mobile receiving/scanning
   - Push notifications for status changes
   - Photo capture for delivery verification

---

## API Reference

For backend developers, see [API_SUPPLIER_ORDERS.md](./API_SUPPLIER_ORDERS.md) for complete endpoint documentation including:

- Request/response schemas
- Query parameters
- Error codes
- Authentication requirements
- Rate limiting
- Example workflows

---

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review API documentation on backend issues
3. Check browser console for client-side errors
4. Contact system administrator for server issues

---

**Last Updated:** January 2025
**Version:** 1.0
