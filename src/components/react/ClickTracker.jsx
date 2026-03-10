import React, { useEffect } from 'react';
import useStore from '../../store/useStore';

export default function ClickTracker() {
  const addClickData = useStore((state) => state.addClickData);
  const loadHeatmapData = useStore((state) => state.loadHeatmapData);

  useEffect(() => {
    // Cargar los datos guardados en localStorage al iniciar
    loadHeatmapData();

    const handleClick = (e) => {
      // Ignorar clics dentro del Panel de Administrador (para no ensuciar datos)
      if (e.target.closest('#config-panel')) return;

      // Extraer datos semánticos y de coordenadas
      const x = e.clientX;
      const y = e.clientY;
      const targetTag = e.target.tagName;
      const targetId = e.target.id || null;

      // Obtener la sección actual desde Zustand globalmente (sin suscribirse para evitar re-renders de este tracker invisible)
      const currentSectionIndex = useStore.getState().currentSectionIndex;

      addClickData(x, y, currentSectionIndex, targetTag, targetId);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [addClickData, loadHeatmapData]);

  // Componente invisible, no renderiza nada
  return null;
}
