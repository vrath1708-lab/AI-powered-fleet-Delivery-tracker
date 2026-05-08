import DriverCard from './DriverCard';

export default function DriversList({ drivers, orders }) {
  // Create a map of order IDs to orders for quick lookup
  const orderMap = {};
  if (orders && Array.isArray(orders)) {
    orders.forEach(o => {
      orderMap[o._id] = o;
    });
  }

  return (
    <div className="panel drivers-panel list-panel">
      <div className="panel-head">
        <div>
          <p className="panel-label">Fleet</p>
          <h2>Driver Status</h2>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          {drivers?.filter(d => d.assignedOrderId).length || 0}/{drivers?.length || 0} Active
        </div>
      </div>
      <div className="drivers-list">
        {(drivers || []).map((driver) => {
          const assignedOrder = driver.assignedOrderId ? orderMap[driver.assignedOrderId] : null;
          return (
            <DriverCard
              key={driver._id}
              driver={driver}
              assignedOrder={assignedOrder}
            />
          );
        })}
      </div>
    </div>
  );
}
