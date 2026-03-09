// src/store/useStore.js
import { create } from 'zustand';
import initialConfig from '../config';

const useStore = create((set) => ({
  // Estado Inicial basado en config.js
  config: initialConfig,
  currentSectionIndex: 0,
  isAdminMode: false,

  // Acciones
  toggleAdminMode: () => set((state) => ({ isAdminMode: !state.isAdminMode })),
  setConfig: (newConfig) => set({ config: newConfig }),

  updateContent: (key, value) => set((state) => {
    // Para la Fase 2 actualizamos el array de secciones (específicamente la Hero por ahora)
    const newSections = [...state.config.sections];
    if (newSections[0].id === 'hero') {
      newSections[0] = {
        ...newSections[0],
        data: {
          ...newSections[0].data,
          [key]: value
        }
      };
    }

    return {
      config: {
        ...state.config,
        sections: newSections
      }
    };
  }),

  updateBackground: (key, value) => set((state) => ({
    config: {
      ...state.config,
      background: { ...state.config.background, [key]: value }
    }
  })),

  updateAnimation: (key, value) => set((state) => ({
    config: {
      ...state.config,
      animation: { ...state.config.animation, [key]: value }
    }
  })),

  setCurrentSectionIndex: (index) => set({ currentSectionIndex: index }),
}));

export default useStore;
