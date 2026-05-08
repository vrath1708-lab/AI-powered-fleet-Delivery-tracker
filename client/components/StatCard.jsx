export default function StatCard({ label, value }) {
  return (
    <article className="panel stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
