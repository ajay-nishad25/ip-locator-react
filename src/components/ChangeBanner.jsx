export default function ChangeBanner({ banner, onClose }) {
  return (
    <div className={`change-banner ${banner.show ? 'show' : ''}`}>
      <div className="banner-icon">⚡</div>
      <div className="banner-body">
        <div className="banner-title">IP ADDRESS CHANGED</div>
        <div className="banner-ips">
          <span className="banner-old">{banner.oldIP}</span>
          <span className="banner-arrow">→</span>
          <span className="banner-new">{banner.newIP}</span>
        </div>
        <div className="banner-meta">Detected at {banner.time}</div>
      </div>
      <button className="banner-close" onClick={onClose}>✕</button>
    </div>
  );
}
