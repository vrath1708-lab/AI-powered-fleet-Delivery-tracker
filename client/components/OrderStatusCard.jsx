import StatusBadge from './StatusBadge';

export default function OrderStatusCard({ order, driver }) {
  const getPhaseNumber = (status) => {
    const phases = {
      'Waiting for driver': 1,
      'Driver assigned, heading to pickup': 2,
      'Driver picking up order': 3,
      'Out for delivery': 4,
      'Delivered': 5
    };
    return phases[status] || 0;
  };

  const currentPhase = getPhaseNumber(order.status);

  return (
    <div
      className="order-status-card"
      style={{
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        marginBottom: '12px',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            {order.code}
          </div>
          <div style={{ fontSize: '0.95rem', color: '#f1f5f9', fontWeight: '500' }}>
            {order.customer}
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Driver Info */}
      {driver && (
        <div
          style={{
            padding: '10px',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderRadius: '8px',
            marginBottom: '12px',
            borderLeft: '3px solid #3b82f6'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>ASSIGNED DRIVER</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '0.95rem' }}>
                {driver.name} • {driver.vehicle}
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', textAlign: 'right' }}>
              {driver.currentPhase === 'heading-to-pickup' && 'Going to Pickup'}
              {driver.currentPhase === 'picking-up' && 'At Pickup'}
              {driver.currentPhase === 'heading-to-delivery' && 'Going to Delivery'}
            </div>
          </div>
        </div>
      )}

      {/* Phase Timeline */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Progress
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
          {['📋 Waiting', '🔗 Assigned', '📦 Pickup', '🚚 Delivery', '✅ Done'].map((phase, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: idx < currentPhase ? '#10b981' : 'rgba(148, 163, 184, 0.2)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Locations */}
      {order.pickupPoint && order.deliveryPoint && (
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#cbd5e1' }}>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#94a3b8' }}>📍 Pickup:</span> {order.pickupPoint[0].toFixed(4)}, {order.pickupPoint[1].toFixed(4)}
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>📍 Delivery:</span> {order.deliveryPoint[0].toFixed(4)}, {order.deliveryPoint[1].toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
}
