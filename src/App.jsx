import { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import MatrixRain from './components/MatrixRain';
import ChangeBanner from './components/ChangeBanner';
import InfoCard from './components/InfoCard';
import ChangeLog from './components/ChangeLog';

const POLL_MS = 10000;
const API_URL = 'https://ipinfo.io/json';

const EMPTY = {
  ip: '', city: '', region: '', country: '',
  isp: '', timezone: '', postal: '', lat: null, lon: null,
};

export default function App() {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState({ state: 'loading', text: 'INITIALIZING...' });
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [ipFlash, setIpFlash] = useState(false);
  const [lastChecked, setLastChecked] = useState('—');
  const [countdown, setCountdown] = useState(POLL_MS / 1000);
  const [banner, setBanner] = useState({ show: false, oldIP: '', newIP: '', time: '' });
  const [changeLogs, setChangeLogs] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // ── Refs: single source of truth that never causes re-renders ──
  // Stores the last confirmed IP so we can compare on next poll
  const knownIPRef = useRef(null);
  // Stores the last confirmed full data so InfoCard can detect field changes
  const knownDataRef = useRef(EMPTY);

  // ── Core fetch ────────────────────────────────────────────────
  const fetchIPData = useCallback(async (silent = false) => {
    setScanning(true);
    setError('');
    setStatus({ state: 'loading', text: silent ? 'CHECKING FOR IP CHANGES...' : 'FETCHING NETWORK DATA...' });

    if (!silent) setData(EMPTY);

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (!json.ip) throw new Error('API error: Missing IP address');

      const freshIP = json.ip || 'Unknown';

      // ── Compare against the last known IP (stored in ref) ──
      const oldIP = knownIPRef.current;          // what we had before
      const ipChanged = oldIP !== null && oldIP !== freshIP;

      if (ipChanged) {
        const ts = new Date().toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });

        // Log entry uses the captured oldIP (ref value BEFORE we update it)
        setChangeLogs(prev => [{ oldIP, newIP: freshIP, time: ts }, ...prev]);
        setBanner({ show: true, oldIP, newIP: freshIP, time: ts });
        setTimeout(() => setBanner(b => ({ ...b, show: false })), 8000);

        setIpFlash(true);
        setTimeout(() => setIpFlash(false), 2000);

        setStatus({ state: 'changed', text: '⚡ IP ADDRESS CHANGED!' });
        setTimeout(() => setStatus({ state: 'ok', text: 'MONITORING ACTIVE — NO CHANGES DETECTED' }), 4000);
      } else {
        setStatus({ state: 'ok', text: 'MONITORING ACTIVE — NO CHANGES DETECTED' });
      }

      // Build new data object
      const locParts = json.loc ? json.loc.split(',') : [null, null];
      const freshData = {
        ip: freshIP,
        city: json.city || 'Unknown',
        region: json.region || 'Unknown',
        country: json.country || 'Unknown',
        isp: json.org || 'Unknown',
        timezone: json.timezone || 'Unknown',
        postal: json.postal || 'Unknown',
        lat: locParts[0] ? parseFloat(locParts[0]) : null,
        lon: locParts[1] ? parseFloat(locParts[1]) : null,
      };

      // Update refs AFTER we've used the old values above
      knownIPRef.current = freshIP;
      knownDataRef.current = freshData;

      setData(freshData);
      setLastChecked(new Date().toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
      setLoaded(true);

    } catch (err) {
      setError('⚠ ' + (err.message || 'Could not retrieve IP data.'));
      setStatus({ state: 'error', text: 'FAILED TO FETCH DATA' });
      if (!silent) setData(d => ({ ...d, ip: 'ERROR' }));
    } finally {
      setScanning(false);
    }
  }, []);

  // ── Polling + countdown ───────────────────────────────────────
  useEffect(() => {
    fetchIPData(false);

    const poll = setInterval(() => fetchIPData(true), POLL_MS);

    let cd = POLL_MS / 1000;
    const tick = setInterval(() => {
      cd = cd <= 1 ? POLL_MS / 1000 : cd - 1;
      setCountdown(cd);
    }, 1000);

    return () => { clearInterval(poll); clearInterval(tick); };
  }, [fetchIPData]);

  return (
    <>
      <MatrixRain />
      <div className="vignette" />
      <div className="scanlines" />

      <ChangeBanner
        banner={banner}
        onClose={() => setBanner(b => ({ ...b, show: false }))}
      />

      <div className="app">
        <div className="container">

          {/* Header */}
          <header>
            <div className="title">IP LOCATOR</div>
            <div className="subtitle">Network Identity &amp; Geolocation</div>
          </header>

          {/* Scan bar */}
          <div className={`scan-bar ${scanning ? 'active' : ''}`} />

          {/* Status row */}
          <div className="status-row">
            <div className="status-bar">
              <div className={`status-dot ${status.state}`} />
              <span>{status.text}</span>
            </div>
            <div className="monitor-info">
              <span>LAST CHECKED: {lastChecked}</span>
              <span className="separator">|</span>
              <span>NEXT CHECK IN {countdown}s</span>
            </div>
          </div>

          {/* IP Display */}
          <div className={`ip-display ${loaded ? 'fade-in' : ''}`}>
            <div className={`ip-value ${ipFlash ? 'ip-changed' : ''}`}>
              {data.ip ? data.ip : <span className="loading-dots" />}
            </div>
          </div>

          {/* Info grid */}
          <div className={`info-grid ${loaded ? 'fade-in' : ''}`}>
            <InfoCard label="City" value={data.city} />
            <InfoCard label="Region" value={data.region} />
            <InfoCard label="Country" value={data.country} />
            <InfoCard label="ISP / Org" value={data.isp} />
            <InfoCard label="Timezone" value={data.timezone} />
            <InfoCard label="Postal Code" value={data.postal} />
          </div>

          {/* Coords panel */}
          <div className={`coords-panel ${loaded ? 'fade-in' : ''}`}>
            <div className="coord-item">
              <div className="coord-label">Latitude</div>
              <div className="coord-value">{data.lat != null ? data.lat.toFixed(6) : '—'}</div>
            </div>
            <div className="coord-divider" />
            <div className="coord-item">
              <div className="coord-label">Longitude</div>
              <div className="coord-value">{data.lon != null ? data.lon.toFixed(6) : '—'}</div>
            </div>
            <div className="coord-divider" />
            <div className="coord-item" style={{ alignItems: 'flex-end' }}>
              {data.lat != null && data.lon != null && (
                <a
                  className="map-btn"
                  href={`https://www.openstreetmap.org/?mlat=${data.lat}&mlon=${data.lon}&zoom=12`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📍 Open Map
                </a>
              )}
            </div>
          </div>

          {/* Refresh */}
          <div className="btn-row">
            <button className="refresh-btn" onClick={() => fetchIPData(false)}>
              ↻ &nbsp;REFRESH
            </button>
          </div>

          {error && <div className="error-msg">{error}</div>}

          {/* Change Log */}
          <ChangeLog entries={changeLogs} />

        </div>
      </div>
    </>
  );
}