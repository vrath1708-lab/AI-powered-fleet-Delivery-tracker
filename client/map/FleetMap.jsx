import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { Fragment, useEffect, useRef } from 'react';
import L from 'leaflet';

const driverIcon = new L.DivIcon({
  className: 'driver-icon',
  html: `<img src="/map/re-bike.png" width="48" height="48" style="object-fit:contain;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))"/>`,
  iconSize: [60, 28],
  iconAnchor: [30, 14]
});

const orderIcon = new L.DivIcon({
  className: 'order-icon',
  html: '<span>◆</span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

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
        <span><i className="legend-dot driver" /> Driver</span>
        <span><i className="legend-dot pickup" /> Pickup</span>
        <span><i className="legend-dot order" /> Order</span>
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
        {/* Order markers - hide when delivered */}
        {orders
          .filter((order) => order.status !== 'Delivered')
          .map((order) => (
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
