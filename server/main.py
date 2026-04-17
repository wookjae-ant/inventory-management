from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timedelta, timezone
from uuid import uuid4
from mock_data import inventory_items, orders, demand_forecasts, backlog_items, spending_summary, monthly_spending, category_spending, recent_transactions, purchase_orders

app = FastAPI(title="Factory Inventory Management System")

# In-memory store for restocking orders placed via the Restocking tab.
# Not persisted to disk — restart clears this, matching the rest of the demo.
submitted_orders: List[dict] = []
_submitted_order_counter: int = 0

# Fixed lead time (days) applied to every Submitted Order. Locked in the plan
# to keep expected-delivery deterministic for verification.
RESTOCKING_LEAD_TIME_DAYS: int = 7

# Quarter mapping for date filtering
QUARTER_MAP = {
    'Q1-2025': ['2025-01', '2025-02', '2025-03'],
    'Q2-2025': ['2025-04', '2025-05', '2025-06'],
    'Q3-2025': ['2025-07', '2025-08', '2025-09'],
    'Q4-2025': ['2025-10', '2025-11', '2025-12']
}

def filter_by_month(items: list, month: Optional[str]) -> list:
    """Filter items by month/quarter based on order_date field"""
    if not month or month == 'all':
        return items

    if month.startswith('Q'):
        # Handle quarters
        if month in QUARTER_MAP:
            months = QUARTER_MAP[month]
            return [item for item in items if any(m in item.get('order_date', '') for m in months)]
    else:
        # Direct month match
        return [item for item in items if month in item.get('order_date', '')]

    return items

def apply_filters(items: list, warehouse: Optional[str] = None, category: Optional[str] = None,
                 status: Optional[str] = None) -> list:
    """Apply common filters to a list of items"""
    filtered = items

    if warehouse and warehouse != 'all':
        filtered = [item for item in filtered if item.get('warehouse') == warehouse]

    if category and category != 'all':
        filtered = [item for item in filtered if item.get('category', '').lower() == category.lower()]

    if status and status != 'all':
        filtered = [item for item in filtered if item.get('status', '').lower() == status.lower()]

    return filtered

# CORS: explicit origin allowlist only. Wildcard ("*") with allow_credentials=True
# is rejected by spec-compliant browsers but some stacks silently reflect the
# Origin header instead, enabling cross-site credential theft. Keep credentials
# off until real auth exists, and add production origins here when deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class InventoryItem(BaseModel):
    id: str
    sku: str
    name: str
    category: str
    warehouse: str
    quantity_on_hand: int
    reorder_point: int
    unit_cost: float
    location: str
    last_updated: str

class Order(BaseModel):
    id: str
    order_number: str
    customer: str
    items: List[dict]
    status: str
    order_date: str
    expected_delivery: str
    total_value: float
    actual_delivery: Optional[str] = None
    warehouse: Optional[str] = None
    category: Optional[str] = None

class DemandForecast(BaseModel):
    id: str
    item_sku: str
    item_name: str
    current_demand: int
    forecasted_demand: int
    trend: str
    period: str

class BacklogItem(BaseModel):
    id: str
    order_id: str
    item_sku: str
    item_name: str
    quantity_needed: int
    quantity_available: int
    days_delayed: int
    priority: str
    has_purchase_order: Optional[bool] = False

class PurchaseOrder(BaseModel):
    id: str
    backlog_item_id: str
    supplier_name: str
    quantity: int
    unit_cost: float
    expected_delivery_date: str
    status: str
    created_date: str
    notes: Optional[str] = None

class CreatePurchaseOrderRequest(BaseModel):
    backlog_item_id: str
    supplier_name: str
    quantity: int
    unit_cost: float
    expected_delivery_date: str
    notes: Optional[str] = None

class RestockRecommendationItem(BaseModel):
    sku: str
    item_name: str
    category: str
    warehouse: Optional[str] = None
    current_stock: int
    forecasted_demand: int
    shortfall: int
    unit_cost: float
    recommended_quantity: int
    subtotal: float
    trend: str

class RestockRecommendationsResponse(BaseModel):
    items: List[RestockRecommendationItem]
    budget: float
    allocated_total: float
    remaining_budget: float

class SubmittedOrderItem(BaseModel):
    sku: str
    item_name: str
    quantity: int
    unit_cost: float
    subtotal: float

class SubmittedOrder(BaseModel):
    id: str
    order_number: str
    created_date: str
    expected_delivery: str
    lead_time_days: int
    total_value: float
    items: List[SubmittedOrderItem]
    status: str

class RestockOrderLine(BaseModel):
    sku: str = Field(min_length=1, max_length=32)
    # Bounds prevent negative drain and runaway values regardless of client caps.
    quantity: int = Field(gt=0, le=10_000)

class CreateRestockOrderRequest(BaseModel):
    items: List[RestockOrderLine] = Field(min_length=1)

# API endpoints
@app.get("/")
def root():
    return {"message": "Factory Inventory Management System API", "version": "1.0.0"}

@app.get("/api/inventory", response_model=List[InventoryItem])
def get_inventory(
    warehouse: Optional[str] = None,
    category: Optional[str] = None
):
    """Get all inventory items with optional filtering"""
    return apply_filters(inventory_items, warehouse, category)

@app.get("/api/inventory/{item_id}", response_model=InventoryItem)
def get_inventory_item(item_id: str):
    """Get a specific inventory item"""
    item = next((item for item in inventory_items if item["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.get("/api/orders", response_model=List[Order])
def get_orders(
    warehouse: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    month: Optional[str] = None
):
    """Get all orders with optional filtering"""
    filtered_orders = apply_filters(orders, warehouse, category, status)
    filtered_orders = filter_by_month(filtered_orders, month)
    return filtered_orders

@app.get("/api/orders/{order_id}", response_model=Order)
def get_order(order_id: str):
    """Get a specific order"""
    order = next((order for order in orders if order["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.get("/api/demand", response_model=List[DemandForecast])
def get_demand_forecasts():
    """Get demand forecasts"""
    return demand_forecasts

@app.get("/api/backlog", response_model=List[BacklogItem])
def get_backlog():
    """Get backlog items with purchase order status"""
    # Add has_purchase_order flag to each backlog item
    result = []
    for item in backlog_items:
        item_dict = dict(item)
        # Check if this backlog item has a purchase order
        has_po = any(po["backlog_item_id"] == item["id"] for po in purchase_orders)
        item_dict["has_purchase_order"] = has_po
        result.append(item_dict)
    return result

@app.get("/api/dashboard/summary")
def get_dashboard_summary(
    warehouse: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    month: Optional[str] = None
):
    """Get summary statistics for dashboard with optional filtering"""
    # Filter inventory
    filtered_inventory = apply_filters(inventory_items, warehouse, category)

    # Filter orders
    filtered_orders = apply_filters(orders, warehouse, category, status)
    filtered_orders = filter_by_month(filtered_orders, month)

    total_inventory_value = sum(item["quantity_on_hand"] * item["unit_cost"] for item in filtered_inventory)
    low_stock_items = len([item for item in filtered_inventory if item["quantity_on_hand"] <= item["reorder_point"]])
    pending_orders = len([order for order in filtered_orders if order["status"] in ["Processing", "Backordered"]])
    total_backlog_items = len(backlog_items)

    return {
        "total_inventory_value": round(total_inventory_value, 2),
        "low_stock_items": low_stock_items,
        "pending_orders": pending_orders,
        "total_backlog_items": total_backlog_items,
        "total_orders_value": sum(order["total_value"] for order in filtered_orders)
    }

@app.get("/api/spending/summary")
def get_spending_summary():
    """Get spending summary statistics"""
    return spending_summary

@app.get("/api/spending/monthly")
def get_monthly_spending():
    """Get monthly spending breakdown"""
    return monthly_spending

@app.get("/api/spending/categories")
def get_category_spending():
    """Get spending by category"""
    return category_spending

@app.get("/api/spending/transactions")
def get_recent_transactions():
    """Get recent transactions"""
    return recent_transactions

@app.get("/api/reports/quarterly")
def get_quarterly_reports():
    """Get quarterly performance reports"""
    # Calculate quarterly statistics from orders
    quarters = {}

    for order in orders:
        order_date = order.get('order_date', '')
        # Determine quarter
        if '2025-01' in order_date or '2025-02' in order_date or '2025-03' in order_date:
            quarter = 'Q1-2025'
        elif '2025-04' in order_date or '2025-05' in order_date or '2025-06' in order_date:
            quarter = 'Q2-2025'
        elif '2025-07' in order_date or '2025-08' in order_date or '2025-09' in order_date:
            quarter = 'Q3-2025'
        elif '2025-10' in order_date or '2025-11' in order_date or '2025-12' in order_date:
            quarter = 'Q4-2025'
        else:
            continue

        if quarter not in quarters:
            quarters[quarter] = {
                'quarter': quarter,
                'total_orders': 0,
                'total_revenue': 0,
                'delivered_orders': 0,
                'avg_order_value': 0
            }

        quarters[quarter]['total_orders'] += 1
        quarters[quarter]['total_revenue'] += order.get('total_value', 0)
        if order.get('status') == 'Delivered':
            quarters[quarter]['delivered_orders'] += 1

    # Calculate averages and fulfillment rate
    result = []
    for q, data in quarters.items():
        if data['total_orders'] > 0:
            data['avg_order_value'] = round(data['total_revenue'] / data['total_orders'], 2)
            data['fulfillment_rate'] = round((data['delivered_orders'] / data['total_orders']) * 100, 1)
        result.append(data)

    # Sort by quarter
    result.sort(key=lambda x: x['quarter'])
    return result

@app.get("/api/reports/monthly-trends")
def get_monthly_trends():
    """Get month-over-month trends"""
    months = {}

    for order in orders:
        order_date = order.get('order_date', '')
        if not order_date:
            continue

        # Extract month (format: YYYY-MM-DD)
        month = order_date[:7]  # Gets YYYY-MM

        if month not in months:
            months[month] = {
                'month': month,
                'order_count': 0,
                'revenue': 0,
                'delivered_count': 0
            }

        months[month]['order_count'] += 1
        months[month]['revenue'] += order.get('total_value', 0)
        if order.get('status') == 'Delivered':
            months[month]['delivered_count'] += 1

    # Convert to list and sort
    result = list(months.values())
    result.sort(key=lambda x: x['month'])
    return result

@app.get("/api/restocking/recommendations", response_model=RestockRecommendationsResponse)
def get_restocking_recommendations(
    budget: float,
    warehouse: Optional[str] = None,
    category: Optional[str] = None
):
    """
    Recommend items to restock given a budget.

    Ranking: shortfall-first (biggest forecasted_demand - current_stock first),
    tiebroken by lowest unit_cost. Budget is consumed greedily — each item's
    recommended_quantity is capped by both the shortfall and what remains of
    the budget.
    """
    if budget < 0:
        raise HTTPException(status_code=400, detail="budget must be >= 0")

    warehouse_scoped = warehouse and warehouse != 'all'

    recommendations = []
    for forecast in demand_forecasts:
        sku = forecast['item_sku']
        inventory_rows = [item for item in inventory_items if item['sku'] == sku]
        if not inventory_rows:
            # SKU missing from inventory — can't price it, skip.
            continue

        # If a warehouse filter is set, only consider that warehouse's stock for
        # this SKU; otherwise aggregate across warehouses. Unit cost comes from
        # the first matching row (costs are consistent per-SKU in this dataset).
        if warehouse_scoped:
            scoped_rows = [r for r in inventory_rows if r['warehouse'] == warehouse]
            if not scoped_rows:
                continue
            current_stock = sum(r['quantity_on_hand'] for r in scoped_rows)
            primary = scoped_rows[0]
        else:
            current_stock = sum(r['quantity_on_hand'] for r in inventory_rows)
            primary = inventory_rows[0]

        if category and category != 'all' and primary['category'].lower() != category.lower():
            continue

        shortfall = max(0, forecast['forecasted_demand'] - current_stock)
        if shortfall == 0:
            continue

        recommendations.append({
            'sku': sku,
            'item_name': forecast['item_name'],
            'category': primary['category'],
            'warehouse': primary['warehouse'] if warehouse_scoped else None,
            'current_stock': current_stock,
            'forecasted_demand': forecast['forecasted_demand'],
            'shortfall': shortfall,
            'unit_cost': primary['unit_cost'],
            'trend': forecast['trend'],
        })

    # Shortfall desc, then cheapest first.
    recommendations.sort(key=lambda r: (-r['shortfall'], r['unit_cost']))

    remaining = budget
    output = []
    for rec in recommendations:
        max_by_budget = int(remaining // rec['unit_cost']) if rec['unit_cost'] > 0 else rec['shortfall']
        qty = min(rec['shortfall'], max_by_budget)
        if qty <= 0:
            # Nothing fits for this item — skip so the table stays actionable.
            continue
        subtotal = round(qty * rec['unit_cost'], 2)
        remaining = round(remaining - subtotal, 2)
        output.append({**rec, 'recommended_quantity': qty, 'subtotal': subtotal})

    allocated_total = round(budget - remaining, 2)
    return {
        'items': output,
        'budget': round(budget, 2),
        'allocated_total': allocated_total,
        'remaining_budget': round(remaining, 2),
    }

@app.post("/api/restocking/orders", response_model=SubmittedOrder)
def submit_restocking_order(payload: CreateRestockOrderRequest):
    """Create a Submitted Order from the user's chosen line items."""
    global _submitted_order_counter

    line_items = []
    for line in payload.items:
        inventory_row = next((item for item in inventory_items if item['sku'] == line.sku), None)
        if inventory_row is None:
            raise HTTPException(status_code=400, detail=f"Unknown SKU: {line.sku}")
        subtotal = round(line.quantity * inventory_row['unit_cost'], 2)
        line_items.append({
            'sku': line.sku,
            'item_name': inventory_row['name'],
            'quantity': line.quantity,
            'unit_cost': inventory_row['unit_cost'],
            'subtotal': subtotal,
        })

    _submitted_order_counter += 1
    now = datetime.now(timezone.utc)
    order = {
        'id': uuid4().hex[:8],
        'order_number': f"RO-{_submitted_order_counter:05d}",
        'created_date': now.isoformat(),
        'expected_delivery': (now + timedelta(days=RESTOCKING_LEAD_TIME_DAYS)).date().isoformat(),
        'lead_time_days': RESTOCKING_LEAD_TIME_DAYS,
        'total_value': round(sum(li['subtotal'] for li in line_items), 2),
        'items': line_items,
        'status': 'Submitted',
    }
    submitted_orders.append(order)
    return order

@app.get("/api/restocking/orders", response_model=List[SubmittedOrder])
def get_submitted_orders():
    """Return all submitted restocking orders, newest first."""
    return sorted(submitted_orders, key=lambda o: o['created_date'], reverse=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
