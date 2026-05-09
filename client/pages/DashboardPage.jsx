import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import DashboardShell from '../dashboard/DashboardShell.jsx';
import FleetMap from '../map/FleetMap.jsx';
import StatCard from '../components/StatCard.jsx';
import AiQueryPanel from '../components/AiQueryPanel.jsx';
import AdminDeliveryPanel from '../components/AdminDeliveryPanel.jsx';
import OrderGrid from '../components/OrderGrid.jsx';
import DriverGrid from '../components/DriverGrid.jsx';
import HistoryFeed from '../components/HistoryFeed.jsx';

const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
const socketBase = import.meta.env.VITE_SOCKET_BASE_URL ?? '';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [zones, setZones] = useState([]);
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState('Which driver is closest to Order #42?');
  const [aiResult, setAiResult] = useState({ kind: 'help', answer: 'Ask the AI panel about drivers, delays, or routes.' });
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'drivers'
  const activeOrdersCount = orders.filter((order) => order.status !== 'Delivered').length;
  const allDeliveriesComplete = orders.length > 0 && activeOrdersCount === 0;

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetch(`${apiBase}/api/dashboard`).then((res) => res.json()),
      fetch(`${apiBase}/api/drivers`).then((res) => res.json()),
      fetch(`${apiBase}/api/orders`).then((res) => res.json()),
      fetch(`${apiBase}/api/zones`).then((res) => res.json()),
      fetch(`${apiBase}/api/history`).then((res) => res.json())
    ]).then(([dashboardData, driverData, orderData, zoneData, historyData]) => {
      if (!mounted) {
        return;
      }

      setDashboard(dashboardData);
      setDrivers(driverData);
      setOrders(orderData);
      setZones(zoneData);
      setHistory(historyData);
    });

    const socket = io(socketBase);
    socket.on('drivers:update', setDrivers);
    socket.on('orders:update', setOrders);
    socket.on('history:update', setHistory);
    socket.on('dashboard:update', setDashboard);

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, []);

  async function handleAsk() {
    const response = await fetch(`${apiBase}/api/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    setAiResult(data);
  }

  async function handleCreateDelivery(payload) {
    const response = await fetch(`${apiBase}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        status: 'Waiting for driver'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create delivery');
    }

    const createdOrder = await response.json();
    setOrders((currentOrders) => [createdOrder, ...currentOrders]);

    const dashboardResponse = await fetch(`${apiBase}/api/dashboard`);
    if (dashboardResponse.ok) {
      setDashboard(await dashboardResponse.json());
    }

    return createdOrder;
  }

  return (
    <DashboardShell>
      <header className="hero">
        <div>
          <p className="eyebrow">AI Powered Fleet and Delivery Tracker</p>
          <h1>FleetPulse AI</h1>
          <p className="hero-copy">Track drivers live, watch order progress real-time, and ask AI-powered questions.</p>
        </div>
        <div className="hero-card">
          <span>Live operational view</span>
          <strong>{allDeliveriesComplete ? '0' : activeOrdersCount}</strong>
          <p>{allDeliveriesComplete ? 'all deliveries completed' : 'active deliveries on the board'}</p>
        </div>
      </header>

      {allDeliveriesComplete && (
        <div className="completion-banner panel">
          <div>
            <p className="panel-label">Fleet status</p>
            <h2>All deliveries are completed</h2>
          </div>
          <p>Create a new admin delivery to keep testing the pickup and drop workflow on the map.</p>
        </div>
      )}

      <section className="stats-grid">
        <StatCard label="Total Deliveries" value={dashboard?.totalDeliveries ?? 0} />
        <StatCard label="Active Drivers" value={dashboard?.activeDrivers ?? 0} />
        <StatCard label="Completed Orders" value={dashboard?.completedOrders ?? 0} />
        <StatCard label="Pending Orders" value={dashboard?.pendingOrders ?? 0} />
      </section>

      <section className="workspace">
        <FleetMap drivers={drivers} orders={orders} zones={zones} />

        <div className="side-column">
          <AdminDeliveryPanel onCreateDelivery={handleCreateDelivery} activeOrdersCount={activeOrdersCount} />
          <AiQueryPanel query={query} setQuery={setQuery} answer={aiResult.answer} onRunQuery={handleAsk} />
        </div>
      </section>

      {/* Main content grid: Orders and Drivers as cards */}
      <section style={{ marginTop: '32px' }}>
        <OrderGrid orders={orders} drivers={drivers} />
        <DriverGrid drivers={drivers} orders={orders} />
      </section>

      {/* Status Log Modal Button */}
      <section style={{ marginTop: '24px' }}>
        <HistoryFeed history={history} />
      </section>
    </DashboardShell>
  );
}
