import OrderStatusCard from './OrderStatusCard';

export default function OrderList({ orders, drivers }) {
  // Create a map of driver IDs to drivers for quick lookup
  const driverMap = {};
  if (drivers && Array.isArray(drivers)) {
    drivers.forEach(d => {
      driverMap[d._id] = d;
    });
  }

  // Sort orders: active first, then completed
  const sortedOrders = [...(orders || [])].sort((a, b) => {
    const aActive = a.status !== 'Delivered' ? 0 : 1;
    const bActive = b.status !== 'Delivered' ? 0 : 1;

    if (aActive !== bActive) {
      return aActive - bActive;
    }

    return new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);
  });

  return (
    <div className="panel list-panel">
      <div className="panel-head">
        <div>
          <p className="panel-label">Orders</p>
          <h2>Real-time Status Feed</h2>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          {orders?.filter(o => o.status !== 'Delivered').length || 0} Active
        </div>
      </div>
      <div className="list">
        {sortedOrders.map((order) => {
          const assignedDriver = order.assignedDriverId ? driverMap[order.assignedDriverId] : null;
          return (
            <OrderStatusCard
              key={order._id}
              order={order}
              driver={assignedDriver}
            />
          );
        })}
      </div>
    </div>
  );
}

