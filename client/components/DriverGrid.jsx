import { useState } from 'react';
import DriverCard from './DriverCard';

export default function DriverGrid({ drivers, orders }) {
  const [showAll, setShowAll] = useState(false);

  // Create a map of order IDs to orders for quick lookup
  const orderMap = {};
  if (orders && Array.isArray(orders)) {
    orders.forEach(o => {
      orderMap[o._id] = o;
    });
  }

  // Sort drivers: active first
  const sortedDrivers = [...(drivers || [])].sort((a, b) => {
    const aActive = a.assignedOrderId ? 0 : 1;
    const bActive = b.assignedOrderId ? 0 : 1;
    return aActive - bActive;
  });

  const displayedDrivers = showAll ? sortedDrivers : sortedDrivers.slice(0, 4);

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
          <p className="panel-label">Drivers</p>
          <h2 style={{ margin: 0 }}>Fleet Status</h2>
        </div>
        {sortedDrivers.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(0, 210, 201, 0.2)',
              color: '#00d2c9',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 210, 201, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0, 210, 201, 0.2)';
            }}
          >
            {showAll ? 'Show Less' : `View All (${sortedDrivers.length})`}
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
        {displayedDrivers.map((driver) => {
          const assignedOrder = driver.assignedOrderId ? orderMap[driver.assignedOrderId] : null;
          return (
            <div key={driver._id} style={{ minHeight: '1px' }}>
              <DriverCard driver={driver} assignedOrder={assignedOrder} />
            </div>
          );
        })}
      </div>

      {sortedDrivers.length === 0 && (
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
          No drivers available
        </div>
      )}
    </div>
  );
}
