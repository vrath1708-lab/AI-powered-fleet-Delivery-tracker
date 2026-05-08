import { useState } from 'react';

export default function HistoryFeed({ history }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 16px',
          borderRadius: '12px',
          border: 'none',
          background: 'rgba(59, 130, 246, 0.2)',
          color: '#3b82f6',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(59, 130, 246, 0.35)';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(59, 130, 246, 0.2)';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        📋 View Status Log ({history.length})
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="panel"
            style={{
              maxWidth: '600px',
              maxHeight: '80vh',
              width: '90%',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideIn 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-head">
              <div>
                <p className="panel-label">Delivery History</p>
                <h2>Status log</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#f5f7fb',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px'
                }}
              >
                ✕
              </button>
            </div>
            <div className="list" style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
              {history.map((entry) => (
                <article key={entry._id} className="list-item history-item">
                  <div>
                    <strong>{entry.event}</strong>
                    <p>{entry.notes}</p>
                  </div>
                  <span className="status pending">{new Date(entry.recordedAt).toLocaleTimeString()}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
