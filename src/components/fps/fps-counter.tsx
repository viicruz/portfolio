'use client';

import { useEffect, useRef, useState } from 'react';

export default function FPSCounter() {
  const [fps, setFps] = useState(0);
  const frames = useRef(0);
  const last = useRef<number>(performance.now());

  useEffect(() => {
    let rafId = 0;
    const loop = (now: number) => {
      frames.current++;
      const delta = now - last.current;
      if (delta >= 500) {
        setFps(Math.round((frames.current * 1000) / delta));
        frames.current = 0;
        last.current = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="absolute top-2 left-2 z-50 bg-black/60 text-white px-2 py-1 rounded font-mono text-sm">
      FPS: {fps}
    </div>
  );
}
