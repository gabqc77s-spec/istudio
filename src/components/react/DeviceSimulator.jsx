// src/components/react/DeviceSimulator.jsx
import React from 'react';
import useStore from '../../store/useStore';

const DeviceSimulator = ({ children }) => {
  const previewMode = useStore((state) => state.previewMode);

  if (previewMode === 'desktop') {
    return <>{children}</>;
  }

  const isMobile = previewMode === 'mobile';

  const width = isMobile ? '375px' : '768px';
  const height = isMobile ? '812px' : '1024px';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 0,
    }}>
      <div style={{
        width,
        height,
        backgroundColor: '#000',
        borderRadius: '36px',
        border: '12px solid #333',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: 'scale(1)' // Crucial: forces position: fixed children (.html-container) to be relative to THIS div, not the browser viewport
      }}>
        {children}
      </div>
    </div>
  );
};

export default DeviceSimulator;
