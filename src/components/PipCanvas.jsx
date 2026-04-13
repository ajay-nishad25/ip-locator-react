import React, { useEffect, useRef, useState } from 'react';

export default function PipCanvas({ ip, status, lastChecked }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const reqRef = useRef(null);
  const [isPipActive, setIsPipActive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    // Capture the stream from canvas at 30 fps
    // Use try-catch because captureStream might not be supported on very old browsers
    try {
      const stream = canvas.captureStream(30);
      video.srcObject = stream;

      // Autoplay requires muted (which is true by default here)
      video.play().catch((err) => {
        console.warn("Autoplay blocked for hidden PiP video. User must explicitly click toggle.", err);
      });
    } catch (e) {
      console.warn("captureStream not supported", e);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const draw = () => {
      ctx.fillStyle = '#050a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#0d3a5c';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

      ctx.fillStyle = '#00ff15';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('IP LOCATOR', canvas.width / 2, 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px monospace';
      ctx.fillText(ip || 'SCANNING...', canvas.width / 2, 115);

      const stateColor = status.state === 'error' ? '#ff4466' : (status.state === 'changed' ? '#ffdd00' : '#00ff15');
      ctx.fillStyle = stateColor;
      ctx.font = '18px monospace';
      ctx.fillText(status.text || 'MONITORING ACTIVE', canvas.width / 2, 170);

      const timeStr = new Date().toLocaleTimeString();
      ctx.fillStyle = '#c8e8f0';
      ctx.font = '16px monospace';
      ctx.fillText(`Last Checked: ${lastChecked || '—'}  |  Time: ${timeStr}`, canvas.width / 2, 210);
    };

    // Draw initially
    draw();

    // requestAnimationFrame stops completely when the tab is hidden (e.g. mobile home screen).
    // Using setInterval ensures the canvas keeps being updated while PiP keeps the tab alive!
    const intervalId = setInterval(draw, 1000);
    reqRef.current = intervalId;

    return () => {
      clearInterval(reqRef.current);
    };
  }, [ip, status, lastChecked]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnterPip = () => setIsPipActive(true);
    const onLeavePip = () => setIsPipActive(false);

    video.addEventListener('enterpictureinpicture', onEnterPip);
    video.addEventListener('leavepictureinpicture', onLeavePip);

    return () => {
      video.removeEventListener('enterpictureinpicture', onEnterPip);
      video.removeEventListener('leavepictureinpicture', onLeavePip);
    };
  }, []);

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      } else {
        if (video.paused) {
          await video.play();
        }
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error('Failed to toggle PiP:', err);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={500}
        height={240}
        style={{ display: 'none' }}
      />
      {/* We use autoPictureInPicture so that tab changes / backgrounding triggers PiP */}
      <video
        ref={videoRef}
        autoPictureInPicture
        controls={false}
        muted
        playsInline
        style={{ display: 'none' }}
      />
      <button 
        className={`pip-btn ${isPipActive ? 'active' : ''}`}
        onClick={togglePip}
        title="Toggle Picture-in-Picture"
      >
        ◧ {isPipActive ? 'PiP ACTIVE' : 'ENABLE PiP'}
      </button>
    </>
  );
}
