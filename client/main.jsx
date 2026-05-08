import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/DashboardPage.jsx';
import 'leaflet/dist/leaflet.css';
import './styles.css';

const rootElement = document.getElementById('root');

if (!window.__fleetPulseRoot) {
  window.__fleetPulseRoot = ReactDOM.createRoot(rootElement);
}

window.__fleetPulseRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

