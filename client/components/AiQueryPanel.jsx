export default function AiQueryPanel({ query, setQuery, answer, onRunQuery }) {
  return (
    <div className="panel ai-panel">
      <div className="panel-head">
        <div>
          <p className="panel-label">AI Query</p>
          <h2>Ask operational questions</h2>
        </div>
      </div>
      <textarea value={query} onChange={(event) => setQuery(event.target.value)} rows={4} />
      <button onClick={onRunQuery}>Run query</button>
      <p className="answer">{answer}</p>
    </div>
  );
}
