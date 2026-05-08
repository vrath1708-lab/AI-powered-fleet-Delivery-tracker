export default function StatusBadge({ status }) {
  const configs = {
    'Waiting for driver': {
      icon: '⏳',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.3)'
    },
    'Driver assigned, heading to pickup': {
      icon: '🚗',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.3)'
    },
    'Driver picking up order': {
      icon: '📦',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: 'rgba(139, 92, 246, 0.3)'
    },
    'Out for delivery': {
      icon: '🚚',
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      borderColor: 'rgba(6, 182, 212, 0.3)'
    },
    Delivered: {
      icon: '✅',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.3)'
    }
  };

  const config = configs[status] || {
    icon: '•',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: 'rgba(107, 114, 128, 0.3)'
  };

  return (
    <span
      className="status-badge"
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '500',
        border: `1px solid ${config.borderColor}`,
        whiteSpace: 'nowrap'
      }}
    >
      <span>{config.icon}</span>
      <span>{status}</span>
    </span>
  );
}
