// src/components/react/HeatmapLayer.jsx
import React, { useEffect, useState } from 'react';
import useStore from '../../store/useStore';

const HeatmapLayer = () => {
  const isHeatmapVisible = useStore((state) => state.isHeatmapVisible);
  const clickData = useStore((state) => state.clickData);
  const addClickData = useStore((state) => state.addClickData);
  const isAdminMode = useStore((state) => state.isAdminMode);

  // Record all clicks on the document
  useEffect(() => {
    const handleClick = (e) => {
      // Don't record clicks on the admin panel itself or if admin mode is true to prevent noise
      if (isAdminMode) return;
      addClickData(e.clientX, e.clientY);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isAdminMode, addClickData]);

  if (!isHeatmapVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 9999, // Above everything
      background: 'rgba(0,0,0,0.4)', // Dim background to make heat stand out
    }}>
      {clickData.map((point, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: point.y,
            left: point.x,
            width: '40px',
            height: '40px',
            background: 'radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(255,255,0,0.5) 40%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            mixBlendMode: 'screen',
            filter: 'blur(2px)'
          }}
        />
      ))}
      <div style={{ position: 'absolute', top: 20, right: 20, color: 'yellow', fontWeight: 'bold' }}>
        HEATMAP OVERLAY ACTIVE ({clickData.length} data points)
      </div>
    </div>
  );
};

export default HeatmapLayer;
