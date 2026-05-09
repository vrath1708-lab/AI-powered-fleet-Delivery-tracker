import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';

const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
const socketBase = import.meta.env.VITE_SOCKET_BASE_URL ?? '';

const driverIcon = new L.DivIcon({
  className: 'driver-icon',
  html: '<span>●</span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const orderIcon = new L.DivIcon({
  className: 'order-icon',
  html: '<span>◆</span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [zones, setZones] = useState([]);
  const [query, setQuery] = useState('Which driver is closest to Order #42?');
  const [answer, setAnswer] = useState('Ask the AI panel about drivers, delays, or routes.');

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetch(`${apiBase}/api/dashboard`).then((res) => res.json()),
      fetch(`${apiBase}/api/drivers`).then((res) => res.json()),
      fetch(`${apiBase}/api/orders`).then((res) => res.json()),
      fetch(`${apiBase}/api/zones`).then((res) => res.json())
    ]).then(([dashboardData, driverData, orderData, zoneData]) => {
      if (!mounted) {
        return;
      }

      setDashboard(dashboardData);
      setDrivers(driverData);
      setOrders(orderData);
      setZones(zoneData);
    });

    const socket = io(socketBase);
    socket.on('driver:update', (driverUpdate) => {
      setDrivers((current) => current.map((driver) => (driver._id === driverUpdate._id ? driverUpdate : driver)));
    });
    socket.on('order:update', (orderUpdate) => {
      setOrders((current) => current.map((order) => (order._id === orderUpdate._id ? orderUpdate : order)));
    });
    socket.on('dashboard:update', setDashboard);

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, []);

  const activeDrivers = useMemo(() => drivers.filter((driver) => driver.status === 'active'), [drivers]);
  const mapCenter = drivers[0]?.location ?? [28.6139, 77.209];

  async function handleAsk() {
    const response = await fetch(`${apiBase}/api/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    setAnswer(data.answer);
  }

  return (
    <div className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">AI Powered Fleet and Delivery Tracker</p>
          <h1>FleetPulse AI</h1>
          <p className="hero-copy">Track drivers live, watch order progress, and ask route questions in one dashboard.</p>
        </div>
        <div className="hero-card">
          <span>Live operational view</span>
          <strong>{dashboard?.activeDrivers ?? activeDrivers.length}</strong>
          <p>drivers on route right now</p>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard label="Total Deliveries" value={dashboard?.totalDeliveries ?? 0} />
        <StatCard label="Active Drivers" value={dashboard?.activeDrivers ?? 0} />
        <StatCard label="Completed Orders" value={dashboard?.completedOrders ?? 0} />
        <StatCard label="Pending Orders" value={dashboard?.pendingOrders ?? 0} />
      </section>

      <section className="workspace">
        <div className="panel map-panel">
          <div className="panel-head">
            <div>
              <p className="panel-label">Live Map</p>
              <h2>Drivers, zones, and routes</h2>
            </div>
            <span className="pill">Socket updates enabled</span>
          </div>
          <MapContainer center={mapCenter} zoom={12} className="map">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {zones.map((zone) => (
              <Circle
                key={zone._id}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.15 }}
              />
            ))}
            {drivers.map((driver) => (
              <Marker key={driver._id} position={driver.location} icon={driverIcon}>
                <Popup>
                  <strong>{driver.name}</strong>
                  <br />
                  {driver.vehicle}
                  <br />
                  {driver.status}
                </Popup>
              </Marker>
            ))}
            {orders.map((order) => (
              <Marker key={order._id} position={order.deliveryPoint} icon={orderIcon}>
                <Popup>
                  <strong>{order.code}</strong>
                  <br />
                  {order.customer}
                  <br />
                  {order.status}
                </Popup>
              </Marker>
            ))}
            {drivers.map((driver) => (
              <Polyline key={driver._id} positions={driver.route} pathOptions={{ color: '#ff8c42', weight: 3, opacity: 0.8 }} />
            ))}
          </MapContainer>
        </div>

        <div className="side-column">
          <div className="panel ai-panel">
            <div className="panel-head">
              <div>
                <p className="panel-label">AI Query</p>
                <h2>Ask operational questions</h2>
              </div>
            </div>
            <textarea value={query} onChange={(event) => setQuery(event.target.value)} rows={4} />
            <button onClick={handleAsk}>Run query</button>
            <p className="answer">{answer}</p>
          </div>

          <div className="panel list-panel">
            <div className="panel-head">
              <div>
                <p className="panel-label">Orders</p>
                <h2>Status feed</h2>
              </div>
            </div>
            <div className="list">
              {orders.map((order) => (
                <article key={order._id} className="list-item">
                  <div>
                    <strong>{order.code}</strong>
                    <p>{order.customer}</p>
                  </div>
                  <span className={`status ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>{order.status}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="panel stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
