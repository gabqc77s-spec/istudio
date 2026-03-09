// src/components/react/ConfigPanel.jsx
import React from 'react';
import { HexColorPicker } from 'react-colorful';
import useStore from '../../store/useStore';
import SectionManager from './SectionManager';
import MediaLibrary from './MediaLibrary';
import ActionBuilder from './ActionBuilder';

// --- Styles --- (Keeping them here for brevity)
const panelStyles = { position: 'fixed', top: '20px', right: '20px', backgroundColor: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', zIndex: 100, width: '280px', fontFamily: 'Inter, sans-serif', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' };
const sectionStyles = { marginBottom: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' };
const labelStyles = { display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 };
const inputStyles = { width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', padding: '8px', color: 'white', marginBottom: '16px' };
const selectStyles = { ...inputStyles, appearance: 'none' };
const checkboxContainerStyles = { display: 'flex', alignItems: 'center', marginBottom: '16px' };
const checkboxLabelStyles = { marginLeft: '8px' };
const exportButtonStyles = { width: '100%', padding: '12px', backgroundColor: '#9333ea', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'background-color 0.2s' };


const ConfigPanel = () => {
  const config = useStore((state) => state.config);
  const updateContent = useStore((state) => state.updateContent);
  const updateBackground = useStore((state) => state.updateBackground);
  const updateAnimation = useStore((state) => state.updateAnimation);
  const toggleHeatmap = useStore((state) => state.toggleHeatmap);
  const isHeatmapVisible = useStore((state) => state.isHeatmapVisible);
  const previewMode = useStore((state) => state.previewMode);
  const setPreviewMode = useStore((state) => state.setPreviewMode);
  const toggleWireframe = useStore((state) => state.toggleWireframe);
  const isWireframeMode = useStore((state) => state.isWireframeMode);
  const qualityLOD = useStore((state) => state.qualityLOD);
  const setQualityLOD = useStore((state) => state.setQualityLOD);
    
  const handleContentChange = (e) => {
    updateContent(e.target.name, e.target.value);
  };

  const handleBackgroundChange = (key, value) => {
    updateBackground(key, value);
  }

  const [isPublishing, setIsPublishing] = React.useState(false);

  const handleExport = () => {
    const configString = JSON.stringify(config, null, 2);
    prompt("Copy this configuration and ask me to update the config.js file:", `const config = ${configString};\n\nexport default config;`);
  }

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch('/api/saveConfig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await response.json();
      if (data.success) {
        alert("¡Éxito! " + data.message);
      } else {
        alert("Error al publicar: " + data.message);
      }
    } catch (error) {
      alert("Error de red al intentar publicar.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div style={panelStyles}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>iStudio Controls</h3>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => useStore.temporal.getState().undo()} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }} title="Deshacer">↩</button>
          <button onClick={() => useStore.temporal.getState().redo()} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }} title="Rehacer">↪</button>
        </div>
      </div>

      {/* --- Viewport Simulator --- */}
      <div style={sectionStyles}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Live Preview</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['desktop', 'tablet', 'mobile'].map((mode) => (
            <button
              key={mode}
              onClick={() => setPreviewMode(mode)}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: previewMode === mode ? '#9333ea' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '12px'
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* --- Content Section --- */}
      <div style={sectionStyles}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Hero Section</h4>
        <label style={labelStyles}>Logo URL</label>
        <input type="text" name="logoUrl" value={config.sections.find(s => s.id === 'hero')?.data?.logoUrl || ''} onChange={handleContentChange} style={inputStyles} placeholder="https://..."/>
        <label style={labelStyles}>Main Title</label>
        <input type="text" name="title" value={config.sections.find(s => s.id === 'hero')?.data?.title || ''} onChange={handleContentChange} style={inputStyles} />
        <label style={labelStyles}>Subtitle</label>
        <input type="text" name="subtitle" value={config.sections.find(s => s.id === 'hero')?.data?.subtitle || ''} onChange={handleContentChange} style={inputStyles} />

        <h4 style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '12px' }}>Global Alignment</h4>
        <label style={labelStyles}>Vertical Align</label>
        <select name="justifyContent" value={config.content.justifyContent} onChange={(e) => useStore.getState().setConfig({ ...config, content: { ...config.content, justifyContent: e.target.value } })} style={selectStyles}>
            <option value="flex-start">Top</option>
            <option value="center">Center</option>
            <option value="flex-end">Bottom</option>
        </select>

        <label style={labelStyles}>Horizontal Align</label>
        <select name="alignItems" value={config.content.alignItems} onChange={(e) => useStore.getState().setConfig({ ...config, content: { ...config.content, alignItems: e.target.value } })} style={selectStyles}>
            <option value="flex-start">Left</option>
            <option value="center">Center</option>
            <option value="flex-end">Right</option>
        </select>
      </div>

      {/* --- Animation & Background Sections... --- */}
      {/* --- Theming --- */}
      <div style={sectionStyles}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Global Theme</h4>
        <select
          value={useStore((state) => state.activeTheme)}
          onChange={(e) => useStore.getState().applyTheme(e.target.value)}
          style={selectStyles}
        >
            <option value="default">Default (Purple)</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="corporate">Corporate</option>
        </select>
      </div>

      <div style={sectionStyles}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Analytics & Debugging</h4>
        <div style={checkboxContainerStyles}>
          <input type="checkbox" id="heatmap" checked={isHeatmapVisible} onChange={toggleHeatmap} />
          <label htmlFor="heatmap" style={checkboxLabelStyles}>Show Heatmap Overlay</label>
        </div>
        <div style={checkboxContainerStyles}>
          <input type="checkbox" id="wireframe" checked={isWireframeMode} onChange={toggleWireframe} />
          <label htmlFor="wireframe" style={checkboxLabelStyles}>3D Wireframe Mode</label>
        </div>
        <label style={labelStyles}>Geometry LOD (Performance)</label>
        <select value={qualityLOD} onChange={(e) => setQualityLOD(e.target.value)} style={selectStyles}>
            <option value="high">High Quality (Smooth)</option>
            <option value="low">Low Quality (Fast)</option>
        </select>
      </div>

      {/* --- Section Manager (Drag & Drop) --- */}
      <SectionManager />

      {/* --- Media Library (Phase 9) --- */}
      <MediaLibrary />

      {/* --- Action Builder / Events (Phase 11) --- */}
      <ActionBuilder />

      {/* --- Animation & Background Sections... --- */}
      <div style={sectionStyles}><h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Animation</h4><label style={labelStyles}>Transition Speed: {config.animation.duration.toFixed(1)}s</label><input type="range" min="0.5" max="5" step="0.1" value={config.animation.duration} onChange={(e) => updateAnimation('duration', parseFloat(e.target.value))} style={{width: '100%'}}/></div>
      <div style={sectionStyles}><h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Background</h4><div style={checkboxContainerStyles}><input type="checkbox" id="interactive" checked={config.background.interactive} onChange={(e) => handleBackgroundChange('interactive', e.target.checked)}/><label htmlFor="interactive" style={checkboxLabelStyles}>Enable Cursor Effect</label></div><label style={labelStyles}>Particle Color</label><HexColorPicker color={config.background.color} onChange={(newColor) => handleBackgroundChange('color', newColor)}/><label style={{ ...labelStyles, marginTop: '20px' }}>Particle Size: {config.background.size.toFixed(3)}</label><input type="range" min="0.005" max="0.05" step="0.001" value={config.background.size} onChange={(e) => handleBackgroundChange('size', parseFloat(e.target.value))} style={{width: '100%', marginBottom: '20px'}}/><label style={labelStyles}>Particle Count: {config.background.count}</label><input type="range" min="500" max="10000" step="100" value={config.background.count} onChange={(e) => handleBackgroundChange('count', parseInt(e.target.value, 10))} style={{width: '100%'}}/></div>

      {/* --- In-Game Visual Editor & Shaders (Phase 8 & 13) --- */}
      <div style={sectionStyles}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Materials (Phone)</h4>

        <label style={labelStyles}>Material Type</label>
        <select
          value={config.materials?.phone?.type || 'standard'}
          onChange={(e) => useStore.getState().updateMaterial('phone', 'type', e.target.value)}
          style={selectStyles}
        >
            <option value="standard">Standard (Plastic/Matte)</option>
            <option value="glass">Frosted Glass (Physical)</option>
            <option value="gold">Solid Gold</option>
            <option value="video">Video Texture Mapping</option>
        </select>

        {config.materials?.phone?.type !== 'video' && (
          <>
            <label style={labelStyles}>Base Color</label>
            <HexColorPicker color={config.materials?.phone?.color || '#222'} onChange={(c) => useStore.getState().updateMaterial('phone', 'color', c)} />
            <label style={{ ...labelStyles, marginTop: '10px' }}>Metalness: {config.materials?.phone?.metalness || 0.8}</label>
            <input type="range" min="0" max="1" step="0.1" value={config.materials?.phone?.metalness || 0.8} onChange={(e) => useStore.getState().updateMaterial('phone', 'metalness', parseFloat(e.target.value))} style={{width: '100%'}}/>
            <label style={{ ...labelStyles, marginTop: '10px' }}>Roughness: {config.materials?.phone?.roughness || 0.2}</label>
            <input type="range" min="0" max="1" step="0.1" value={config.materials?.phone?.roughness || 0.2} onChange={(e) => useStore.getState().updateMaterial('phone', 'roughness', parseFloat(e.target.value))} style={{width: '100%'}}/>
          </>
        )}

        <h4 style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '12px' }}>Lighting</h4>
        <label style={labelStyles}>Ambient Intensity</label>
        <input type="range" min="0" max="2" step="0.1" value={config.lighting?.ambientIntensity || 0.5} onChange={(e) => useStore.getState().updateLighting('ambientIntensity', parseFloat(e.target.value))} style={{width: '100%'}}/>
        <label style={{ ...labelStyles, marginTop: '10px' }}>Spotlight Intensity</label>
        <input type="range" min="0" max="5" step="0.1" value={config.lighting?.spotlightIntensity || 1.5} onChange={(e) => useStore.getState().updateLighting('spotlightIntensity', parseFloat(e.target.value))} style={{width: '100%'}}/>
      </div>

      {/* --- Post-Processing (Phase 12) --- */}
      <div style={sectionStyles}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Cinematic Effects</h4>
        <div style={checkboxContainerStyles}>
          <input type="checkbox" id="ppEnabled" checked={config.postprocessing?.enabled} onChange={(e) => useStore.getState().updatePostProcessing('enabled', e.target.checked)} />
          <label htmlFor="ppEnabled" style={checkboxLabelStyles}>Enable Post-Processing</label>
        </div>

        <label style={labelStyles}>Bloom (Neon Glow)</label>
        <input type="range" min="0" max="5" step="0.1" value={config.postprocessing?.bloomIntensity || 1.5} onChange={(e) => useStore.getState().updatePostProcessing('bloomIntensity', parseFloat(e.target.value))} style={{width: '100%'}}/>

        <label style={{ ...labelStyles, marginTop: '10px' }}>Depth of Field (Focus)</label>
        <input type="range" min="0" max="0.1" step="0.001" value={config.postprocessing?.dofFocusDistance || 0.05} onChange={(e) => useStore.getState().updatePostProcessing('dofFocusDistance', parseFloat(e.target.value))} style={{width: '100%'}}/>

        <label style={{ ...labelStyles, marginTop: '10px' }}>Chromatic Aberration (Glitch)</label>
        <input type="range" min="0" max="0.02" step="0.001" value={config.postprocessing?.chromaticAberrationOffset || 0.002} onChange={(e) => useStore.getState().updatePostProcessing('chromaticAberrationOffset', parseFloat(e.target.value))} style={{width: '100%'}}/>
      </div>

      {/* --- Physics Engine (Phase 14) --- */}
      <div style={sectionStyles}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Physics Engine</h4>
        <div style={checkboxContainerStyles}>
          <input type="checkbox" id="physicsEnabled" checked={config.physics?.enabled} onChange={(e) => useStore.getState().updatePhysics('enabled', e.target.checked)} />
          <label htmlFor="physicsEnabled" style={checkboxLabelStyles}>Enable Physics (Gravity & Collisions)</label>
        </div>
        <div style={checkboxContainerStyles}>
          <input type="checkbox" id="physicsDebug" checked={config.physics?.debug} onChange={(e) => useStore.getState().updatePhysics('debug', e.target.checked)} disabled={!config.physics?.enabled} />
          <label htmlFor="physicsDebug" style={checkboxLabelStyles}>Show Physics Hitboxes</label>
        </div>

        <label style={labelStyles}>Gravity Y-Axis</label>
        <input
            type="range" min="-20" max="20" step="0.5"
            value={config.physics?.gravity ? config.physics.gravity[1] : -9.81}
            onChange={(e) => useStore.getState().updatePhysics('gravity', [0, parseFloat(e.target.value), 0])}
            style={{width: '100%'}}
            disabled={!config.physics?.enabled}
        />
      </div>

      <div style={sectionStyles}>
        <button onClick={handleExport} style={exportButtonStyles}>Export Configuration</button>
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          style={{
            ...exportButtonStyles,
            backgroundColor: isPublishing ? '#555' : '#10b981', // Green for publish
            marginTop: '10px'
          }}
        >
          {isPublishing ? 'Publicando...' : 'Publicar Sitio en Vivo'}
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel;
