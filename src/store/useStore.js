// src/store/useStore.js
import { create } from 'zustand';
import { temporal } from 'zundo';
import initialConfig from '../config';

const useStore = create(temporal((set) => ({
  // Estado Inicial basado en config.js
  config: {
    ...initialConfig,
    materials: {
      phone: {
        type: 'standard', // 'standard', 'glass', 'gold', 'video'
        color: '#222222',
        metalness: 0.8,
        roughness: 0.2,
        transmission: 0, // For glass effect
        thickness: 0, // For glass effect
        videoTextureUrl: null
      }
    },
    lighting: {
      ambientIntensity: 0.5,
      spotlightIntensity: 1.5,
      spotlightColor: '#ffffff'
    },
    postprocessing: {
      enabled: true,
      bloomIntensity: 1.5,
      bloomLuminanceThreshold: 0.2,
      dofFocusDistance: 0.05,
      dofFocalLength: 0.1,
      dofBokehScale: 2,
      chromaticAberrationOffset: 0.002
    },
    physics: {
      enabled: false,
      gravity: [0, -9.81, 0],
      debug: false
    },
    media: [],
    customModelUrl: null, // Used to dynamically load a .glb file
    actions: [] // Stores visual logic rules (Trigger -> Action)
  },
  currentSectionIndex: 0,
  activeTheme: 'default',
  isAdminMode: false,
  isTimePaused: false, // Freeze 3D animations during edit mode
  activeAdminTab: 0, // Which section is currently being edited
  isHeatmapVisible: false,
  isWireframeMode: false,
  qualityLOD: 'high', // 'low' | 'high'
  clickData: [], // Stores heatmap click coordinates
  previewMode: 'desktop', // 'desktop' | 'tablet' | 'mobile'
  activeMicroPage: null, // Phase 15: null | 'contact' | 'project_details'

  // Acciones
  setActiveMicroPage: (pageId) => set({ activeMicroPage: pageId }),
  toggleTime: () => set((state) => ({ isTimePaused: !state.isTimePaused })),
  setAdminTab: (index) => set({ activeAdminTab: index, currentSectionIndex: index }),
  toggleWireframe: () => set((state) => ({ isWireframeMode: !state.isWireframeMode })),
  setQualityLOD: (quality) => set({ qualityLOD: quality }),
  addMediaFile: (mediaObj) => set((state) => ({
    config: {
      ...state.config,
      media: [...(state.config.media || []), mediaObj]
    }
  })),

  applyTheme: (themeName) => set((state) => {
    let themeColors = { particle: '#9333ea', textHover: '#9333ea' }; // Default
    if (themeName === 'cyberpunk') themeColors = { particle: '#00ffcc', textHover: '#f0f' };
    if (themeName === 'corporate') themeColors = { particle: '#1e3a8a', textHover: '#3b82f6' };

    // Update global CSS variables for HTML
    document.documentElement.style.setProperty('--primary-glow', themeColors.textHover);

    return {
      activeTheme: themeName,
      config: {
        ...state.config,
        background: {
          ...state.config.background,
          color: themeColors.particle
        }
      }
    };
  }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  toggleAdminMode: () => set((state) => {
    const nextAdminState = !state.isAdminMode;
    return {
      isAdminMode: nextAdminState,
      isTimePaused: nextAdminState // Auto-pause time when entering admin mode
    };
  }),
  toggleHeatmap: () => set((state) => ({ isHeatmapVisible: !state.isHeatmapVisible })),
  addClickData: (x, y) => set((state) => ({ clickData: [...state.clickData, { x, y }] })),
  setConfig: (newConfig) => set({ config: newConfig }),

  reorderSections: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.config.sections);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return {
      config: {
        ...state.config,
        sections: result
      }
    };
  }),

  updateContent: (key, value, sectionId = 'hero') => set((state) => {
    const newSections = state.config.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          data: {
            ...section.data,
            [key]: value
          }
        };
      }
      return section;
    });

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

  updateMaterial: (objectKey, materialKey, value) => set((state) => ({
    config: {
      ...state.config,
      materials: {
        ...state.config.materials,
        [objectKey]: {
          ...state.config.materials[objectKey],
          [materialKey]: value
        }
      }
    }
  })),

  updatePostProcessing: (key, value) => set((state) => ({
    config: {
      ...state.config,
      postprocessing: {
        ...state.config.postprocessing,
        [key]: value
      }
    }
  })),

  updatePhysics: (key, value) => set((state) => ({
    config: {
      ...state.config,
      physics: {
        ...state.config.physics,
        [key]: value
      }
    }
  })),

  updateLighting: (key, value) => set((state) => ({
    config: {
      ...state.config,
      lighting: {
        ...state.config.lighting,
        [key]: value
      }
    }
  })),

  setCurrentSectionIndex: (index) => set({ currentSectionIndex: index }),

  // Action Engine Dispatcher
  dispatchAction: (triggerId) => {
    const state = useStore.getState();
    const rules = state.config.actions || [];

    // Find all rules matching the trigger
    const matchingRules = rules.filter(r => r.trigger === triggerId);

    matchingRules.forEach(rule => {
      switch(rule.action) {
        case 'set_particles_red':
          state.updateBackground('color', '#ff0000');
          break;
        case 'set_particles_blue':
          state.updateBackground('color', '#0000ff');
          break;
        case 'navigate_start':
          state.setCurrentSectionIndex(0);
          break;
        case 'open_modal_contact':
          state.setActiveMicroPage('contact');
          break;
        case 'open_modal_project':
          state.setActiveMicroPage('project_details');
          break;
        default:
          console.warn('Unknown action:', rule.action);
      }
    });
  },

}), {
  partialize: (state) => ({ config: state.config }), // Solo guardar historial de la configuración visual, no del heatmap o UI del admin
}));

export default useStore;
