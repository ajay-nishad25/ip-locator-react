import { useEffect, useState } from 'react';

export default function InfoCard({ label, value, changed }) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (changed) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 4000);
      return () => clearTimeout(t);
    }
  }, [changed, value]);

  const isEmpty = !value || value === '—';
  return (
    <div className="info-card">
      <div className="info-label">{label}</div>
      <div className={`info-value ${isEmpty ? 'placeholder' : ''} ${flash ? 'changed' : ''}`}>
        {value || '—'}
      </div>
    </div>
  );
}
