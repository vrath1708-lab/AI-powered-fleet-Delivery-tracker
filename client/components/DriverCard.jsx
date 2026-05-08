export default function DriverCard({ driver, assignedOrder }) {
  const getStatusColor = (phase) => {
    const colors = {
      'heading-to-pickup': '#3b82f6',
      'picking-up': '#8b5cf6',
      'heading-to-delivery': '#06b6d4',
      default: '#6b7280'
    };
    return colors[phase] || colors.default;
  };

  const getStatusLabel = (phase) => {
    const labels = {
      'heading-to-pickup': 'Going to Pickup 🚗',
      'picking-up': 'Picking Up 📦',
      'heading-to-delivery': 'Out for Delivery 🚚',
      default: 'Idle 🏁'
    };
    return labels[phase] || labels.default;
  };

  const statusColor = getStatusColor(driver.currentPhase);
  const statusLabel = getStatusLabel(driver.currentPhase);
  const isActive = driver.assignedOrderId || driver.currentPhase;

  return (
    <div
      className="driver-card"
      style={{
        padding: '14px',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        border: `1px solid ${isActive ? statusColor + '40' : 'rgba(148, 163, 184, 0.2)'}`,
        borderRadius: '10px',
        marginBottom: '10px',
        transition: 'all 0.3s ease',
        boxShadow: isActive ? `0 0 12px ${statusColor}20` : 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '1rem', color: '#f1f5f9', fontWeight: '600' }}>
            {driver.name}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
            {driver.vehicle}
          </div>
        </div>
        <span
          style={{
            padding: '4px 10px',
            backgroundColor: statusColor + '15',
            color: statusColor,
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            border: `1px solid ${statusColor}40`
          }}
        >
          {driver.status}
        </span>
      </div>

      {/* Current Activity */}
      <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', marginBottom: '10px' }}>
        <div style={{ fontSize: '0.85rem', color: statusColor, fontWeight: '600' }}>
          {statusLabel}
        </div>
        {assignedOrder && (
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>
            {assignedOrder.code} • {assignedOrder.customer}
          </div>
        )}
        {!driver.assignedOrderId && (
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
            Waiting for next order...
          </div>
        )}
      </div>

      {/* Location Info */}
      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#cbd5e1' }}>📍</span> {driver.location[0].toFixed(4)}, {driver.location[1].toFixed(4)}
        </div>
        <div style={{ color: '#64748b' }}>
          {driver.route?.length ? `Route: ${driver.route.length} points` : 'No active route'}
        </div>
      </div>
    </div>
  );
}
