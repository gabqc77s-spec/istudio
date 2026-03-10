import React from 'react';
import useStore from '../../store/useStore';

export default function HeatmapOverlay() {
  const isHeatmapVisible = useStore((state) => state.isHeatmapVisible);
  const clickData = useStore((state) => state.clickData);
  const currentSectionIndex = useStore((state) => state.currentSectionIndex);

  if (!isHeatmapVisible) return null;

  // Filtrar clics para mostrar SOLO los que ocurrieron en la sección activa actualmente en el Panel
  const sectionClicks = clickData.filter(click => click.sectionIndex === currentSectionIndex);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none', // Clave: permite que los clics pasen a través del heatmap
        zIndex: 40 // Debajo del panel de admin que tiene z-50
      }}
    >
      {/* Capa de oscurecimiento opcional para ver mejor los puntos */}
      <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />

      {sectionClicks.map((click, index) => (
        <div
          key={`heatmap-pt-${index}`}
          title={`Tag: ${click.targetTag} | ID: ${click.targetId || 'N/A'}`}
          style={{
            position: 'absolute',
            left: `${click.x}px`,
            top: `${click.y}px`,
            width: '40px',
            height: '40px',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(255,165,0,0.4) 40%, rgba(255,255,0,0) 80%)',
            borderRadius: '50%',
            opacity: 0.8,
            boxShadow: '0 0 10px rgba(255,0,0,0.5)',
            // Si tiene ID y Tag, la hacemos brillar más fuerte para mostrar que fue "Semántico"
            filter: click.targetId ? 'brightness(1.5)' : 'none'
          }}
        />
      ))}

      {/* Indicador superior de modo Heatmap activo */}
      <div className="absolute top-4 right-1/2 translate-x-1/2 bg-red-600/90 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/50 backdrop-blur-md">
        🔥 Visión Calor: Activa (Sección {currentSectionIndex}) - Clics: {sectionClicks.length}
      </div>
    </div>
  );
}
