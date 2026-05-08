import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { Fragment, useEffect, useRef } from 'react';
import L from 'leaflet';

function createBikeSvgDataUrl() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" role="img" aria-label="bike">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="14" cy="22" r="6" stroke="#0b1020" stroke-width="4"/>
        <circle cx="48" cy="22" r="6" stroke="#0b1020" stroke-width="4"/>
        <path d="M14 22l9-10h10l5 10H23l-4 8" stroke="#00d2c9" stroke-width="4"/>
        <path d="M33 12l8 10" stroke="#00d2c9" stroke-width="4"/>
        <path d="M30 8h7" stroke="#ff8c42" stroke-width="4"/>
        <path d="M27 16h8" stroke="#00d2c9" stroke-width="4"/>
        <path d="M41 10l6-2" stroke="#ff8c42" stroke-width="4"/>
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildVehicleSvg({ bodyColor, accentColor, cargoColor, vehicleType }) {
  const bodyPath =
    vehicleType === 'truck'
      ? '<path d="M10 20h34l7 7h8c2.2 0 4 1.8 4 4v4c0 2.2-1.8 4-4 4h-2.8a6.5 6.5 0 0 1-12.4 0H24.2a6.5 6.5 0 0 1-12.4 0H9c-2.2 0-4-1.8-4-4v-9c0-2.2 1.8-4 4-4h1z" fill="' + bodyColor + '"/>'
      : '<path d="M9 21h33l7 6h7c2.2 0 4 1.8 4 4v6c0 2.2-1.8 4-4 4h-2.8a6.5 6.5 0 0 1-12.4 0H24.2a6.5 6.5 0 0 1-12.4 0H8c-2.2 0-4-1.8-4-4v-8c0-2.2 1.8-4 4-4h1z" fill="' + bodyColor + '"/>';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 48" role="img" aria-label="delivery vehicle">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        ${bodyPath}
        <path d="M16 24h18v8H16z" fill="${accentColor}" opacity="0.22"/>
        <path d="M37 20h16l5 6H37z" fill="${accentColor}" opacity="0.34"/>
        <circle cx="20" cy="36" r="5" fill="#0b1020"/>
        <circle cx="50" cy="36" r="5" fill="#0b1020"/>
        <circle cx="20" cy="36" r="2.2" fill="#cbd5e1"/>
        <circle cx="50" cy="36" r="2.2" fill="#cbd5e1"/>
        <rect x="42" y="23" width="11" height="6" rx="1.5" fill="${cargoColor}" opacity="0.9"/>
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createVehicleIcon({ type, className, src, size, anchor, bodyColor, accentColor, cargoColor }) {
  return L.divIcon({
    className: `vehicle-icon vehicle-icon-${className}`,
    html: `<img src="${src ?? buildVehicleSvg({ bodyColor, accentColor, cargoColor, vehicleType: type })}" alt="" aria-hidden="true" />`,
    iconSize: size,
    iconAnchor: anchor
  });
}

function getDriverIcon(driver) {
  const vehicleLabel = `${driver.vehicle ?? ''} ${driver.name ?? ''}`.toLowerCase();

  if (vehicleLabel.includes('bike') || vehicleLabel.includes('scooter') || vehicleLabel.includes('motor')) {
    return createVehicleIcon({
      type: 'bike',
      className: 'bike',
      src: createBikeSvgDataUrl(),
      size: [18, 12],
      anchor: [9, 6],
      bodyColor: '#00d2c9',
      accentColor: '#0b1020',
      cargoColor: '#00d2c9'
    });
  }

  if (vehicleLabel.includes('truck')) {
    return createVehicleIcon({
      type: 'truck',
      className: 'truck',
      size: [46, 30],
      anchor: [23, 15],
      bodyColor: '#ff8c42',
      accentColor: '#2a1d12',
      cargoColor: '#fbbf24'
    });
  }

  return createVehicleIcon({
    type: 'van',
    className: 'van',
    size: [44, 28],
    anchor: [22, 14],
    bodyColor: '#00d2c9',
    accentColor: '#081120',
    cargoColor: '#8ab4ff'
  });
}

function getDriverStatusLabel(driver) {
  const rawStatus = `${driver.phase ?? driver.status ?? 'unknown'}`.trim().toLowerCase();

  if (rawStatus.includes('out') || rawStatus.includes('delivery')) return 'out for delivery';
  if (rawStatus.includes('pickup')) return 'picked up';
  if (rawStatus.includes('idle') || rawStatus.includes('waiting')) return 'idle';
  if (rawStatus.includes('active') || rawStatus.includes('on route')) return 'active';
  if (rawStatus.includes('delivered')) return 'delivered';
  return rawStatus || 'unknown';
}

export default function FleetMap({ drivers, orders, zones }) {
  const mapCenter = drivers[0]?.location ?? [28.6139, 77.209];
  const livePoints = [
    ...drivers.map((driver) => driver.location),
    ...orders.flatMap((order) => [order.pickupPoint, order.deliveryPoint].filter(Boolean)),
    ...orders.map((order) => order.deliveryPoint),
    ...zones.map((zone) => zone.center)
  ];

  return (
    <div className="panel map-panel">
      <div className="panel-head">
        <div>
          <p className="panel-label">Live Map</p>
          <h2>Drivers, zones, and routes</h2>
        </div>
        <span className="pill">Socket updates enabled</span>
      </div>
      <div className="map-legend">
        <span><i className="legend-line live" /> Live route</span>
        <span><i className="legend-vehicle bike" /> Bike driver</span>
        <span><i className="legend-vehicle van" /> Van driver</span>
        <span><i className="legend-vehicle truck" /> Truck driver</span>
        <span><i className="legend-dot pickup" /> Pickup point</span>
        <span><i className="legend-dot order" /> Delivery point</span>
        <span><i className="legend-zone" /> Zone</span>
      </div>
      <MapContainer center={mapCenter} zoom={12} className="map" preferCanvas scrollWheelZoom={false} zoomControl>
        <MapViewport points={livePoints} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {/* Small delivery point highlights - only for non-delivered orders */}
        {orders
          .filter((order) => order.status !== 'Delivered')
          .map((order) => (
            <CircleMarker
              key={`pickup-${order._id}`}
              center={order.pickupPoint ?? order.deliveryPoint}
              radius={8}
              pathOptions={{ color: '#8ab4ff', fillColor: '#8ab4ff', fillOpacity: 0.9, weight: 2 }}
            >
              <Popup>
                <strong>{order.code}</strong>
                <br />
                Pickup point
                <br />
                {order.status}
              </Popup>
            </CircleMarker>
          ))}
        {orders
          .filter((order) => order.status !== 'Delivered')
          .map((order) => (
            <Circle
              key={`delivery-highlight-${order._id}`}
              center={order.deliveryPoint}
              radius={120}
              pathOptions={{ color: '#ff6b6b', fillColor: '#ff6b6b', fillOpacity: 0.25, weight: 1.5, dashArray: '3 3' }}
            />
          ))}
        {drivers.map((driver) => (
          <Marker key={driver._id} position={driver.location} icon={getDriverIcon(driver)}>
            <Popup>
              <strong>{driver.name}</strong>
              <br />
              {driver.vehicle}
              <br />
              Status: {getDriverStatusLabel(driver)}
            </Popup>
          </Marker>
        ))}
        {/* Order markers - hide when delivered */}
        {orders
          .filter((order) => order.status !== 'Delivered')
          .map((order) => (
            <CircleMarker
              key={`order-${order._id}`}
              center={order.deliveryPoint}
              radius={7}
              pathOptions={{ color: '#ff8c42', fillColor: '#ff8c42', fillOpacity: 0.92, weight: 2 }}
            >
              <Popup>
                <strong>{order.code}</strong>
                <br />
                {order.customer}
                <br />
                {order.status}
              </Popup>
            </CircleMarker>
          ))}
        {drivers.map((driver) => {
          // Only show polylines for drivers with assigned orders
          if (!driver.assignedOrderId) {
            return null;
          }

          const raw = Array.isArray(driver.route) ? driver.route : [];
          // sanitize route points to avoid Leaflet errors
          const route = raw.filter((p) => Array.isArray(p) && p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]));

          return (
            <Fragment key={driver._id}>
              {route.length >= 2 && (
                <Polyline
                  key={`${driver._id}-shadow`}
                  positions={route}
                  pathOptions={{ color: '#0b1020', weight: 8, opacity: 0.18, lineCap: 'round', lineJoin: 'round' }}
                />
              )}

              {route.length >= 2 && (
                <Polyline
                  key={driver._id}
                  positions={route}
                  pathOptions={{
                    color: driver.vehicle && driver.vehicle.includes && driver.vehicle.includes('Truck') ? '#ff8c42' : '#00d2c9',
                    weight: 4,
                    opacity: 0.95,
                    lineCap: 'round',
                    lineJoin: 'round',
                    smoothFactor: 1.5
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}

function MapViewport({ points }) {
  const map = useMap();
  const initialized = useRef(false);

  useEffect(() => {
    if (!points.length || initialized.current) {
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds.pad(0.18), { animate: true, duration: 0.5, maxZoom: 14 });
    initialized.current = true;
  }, [map, points]);

  return null;
}
