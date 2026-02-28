export default function ChangeLog({ entries }) {
  return (
    <div className="change-log">
      <div className="log-header">
        <span className="log-title">⚡ IP CHANGE LOG</span>
        <span className="log-live">● LIVE</span>
      </div>
      <div>
        {entries.length === 0 ? (
          <div className="no-changes">No changes detected yet — monitoring active...</div>
        ) : (
          entries.map((e, i) => (
            <div className="log-entry" key={i}>
              <span className="log-time">[{e.time}]</span>
              <span className="log-old">{e.oldIP}</span>
              <span className="log-arrow">→</span>
              <span className="log-new">{e.newIP}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
