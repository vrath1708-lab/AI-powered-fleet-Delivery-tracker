import { useMemo, useState } from 'react';

const defaultForm = {
  code: 'Order #100',
  customer: 'Admin Test Delivery',
  pickupLat: '28.6150',
  pickupLng: '77.2080',
  deliveryLat: '28.6225',
  deliveryLng: '77.2192'
};

export default function AdminDeliveryPanel({ onCreateDelivery, activeOrdersCount }) {
  const [form, setForm] = useState(defaultForm);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Create a delivery to test pickup and drop routing on the live map.');

  const numericFields = useMemo(
    () => ({
      pickupLat: Number(form.pickupLat),
      pickupLng: Number(form.pickupLng),
      deliveryLat: Number(form.deliveryLat),
      deliveryLng: Number(form.deliveryLng)
    }),
    [form]
  );

  async function handleSubmit(event) {
    event.preventDefault();

    const valuesValid = Object.values(numericFields).every((value) => Number.isFinite(value));

    if (!valuesValid || !form.code.trim() || !form.customer.trim()) {
      setStatus('error');
      setMessage('Enter a code, customer, and valid pickup/delivery coordinates.');
      return;
    }

    setStatus('saving');
    setMessage('Creating delivery...');

    try {
      const created = await onCreateDelivery({
        code: form.code.trim(),
        customer: form.customer.trim(),
        pickupPoint: [numericFields.pickupLat, numericFields.pickupLng],
        deliveryPoint: [numericFields.deliveryLat, numericFields.deliveryLng]
      });

      setStatus('saved');
      setMessage(`${created.code} added and queued for driver assignment.`);
      setForm((current) => ({
        ...current,
        code: `Order #${Date.now().toString().slice(-4)}`
      }));
    } catch (error) {
      setStatus('error');
      setMessage(error?.message || 'Failed to create delivery.');
    }
  }

  return (
    <div className="panel admin-panel">
      <div className="panel-head">
        <div>
          <p className="panel-label">Admin Dispatch</p>
          <h2>Add delivery on map</h2>
        </div>
        <span className="pill">{activeOrdersCount} active</span>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label className="field">
            <span>Order code</span>
            <input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} />
          </label>
          <label className="field">
            <span>Customer</span>
            <input value={form.customer} onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))} />
          </label>
        </div>

        <div className="field-grid two-cols">
          <label className="field">
            <span>Pickup latitude</span>
            <input
              value={form.pickupLat}
              onChange={(event) => setForm((current) => ({ ...current, pickupLat: event.target.value }))}
              inputMode="decimal"
            />
          </label>
          <label className="field">
            <span>Pickup longitude</span>
            <input
              value={form.pickupLng}
              onChange={(event) => setForm((current) => ({ ...current, pickupLng: event.target.value }))}
              inputMode="decimal"
            />
          </label>
        </div>

        <div className="field-grid two-cols">
          <label className="field">
            <span>Delivery latitude</span>
            <input
              value={form.deliveryLat}
              onChange={(event) => setForm((current) => ({ ...current, deliveryLat: event.target.value }))}
              inputMode="decimal"
            />
          </label>
          <label className="field">
            <span>Delivery longitude</span>
            <input
              value={form.deliveryLng}
              onChange={(event) => setForm((current) => ({ ...current, deliveryLng: event.target.value }))}
              inputMode="decimal"
            />
          </label>
        </div>

        <button className="admin-submit" type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Creating...' : 'Add delivery to map'}
        </button>
      </form>

      <p className={`admin-feedback ${status}`}>{message}</p>
    </div>
  );
}
