import { useState } from 'react';
import OrderStatusCard from './OrderStatusCard';

export default function OrderGrid({ orders, drivers }) {
  const [showAll, setShowAll] = useState(false);

  // Create a map of driver IDs to drivers for quick lookup
  const driverMap = {};
  if (drivers && Array.isArray(drivers)) {
    drivers.forEach(d => {
      driverMap[d._id] = d;
    });
  }

  // Sort orders: active first
  const sortedOrders = [...(orders || [])].sort((a, b) => {
    const aActive = a.status !== 'Delivered' ? 0 : 1;
    const bActive = b.status !== 'Delivered' ? 0 : 1;
    return aActive - bActive;
  });

  const displayedOrders = showAll ? sortedOrders : sortedOrders.slice(0, 4);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}
      >
        <div>
          <p className="panel-label">Orders</p>
          <h2 style={{ margin: 0 }}>Deliveries in Progress</h2>
        </div>
        {sortedOrders.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#3b82f6',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(59, 130, 246, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(59, 130, 246, 0.2)';
            }}
          >
            {showAll ? 'Show Less' : `View All (${sortedOrders.length})`}
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {displayedOrders.map((order) => {
          const assignedDriver = order.assignedDriverId ? driverMap[order.assignedDriverId] : null;
          return (
            <div key={order._id} style={{ minHeight: '1px' }}>
              <OrderStatusCard order={order} driver={assignedDriver} />
            </div>
          );
        })}
      </div>

      {sortedOrders.length === 0 && (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: '#94a3b8',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            marginBottom: '24px'
          }}
        >
          No active orders
        </div>
      )}
    </div>
  );
}
