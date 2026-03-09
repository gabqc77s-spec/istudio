// src/components/react/ConfigPanel.jsx
import React from 'react';
import { HexColorPicker } from 'react-colorful';
import useStore from '../../store/useStore';

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
    
  const handleContentChange = (e) => {
    updateContent(e.target.name, e.target.value);
  };

  const handleBackgroundChange = (key, value) => {
    updateBackground(key, value);
  }

  const handleExport = () => {
    const configString = JSON.stringify(config, null, 2);
    prompt("Copy this configuration and ask me to update the config.js file:", `const config = ${configString};\n\nexport default config;`);
  }

  return (
    <div style={panelStyles}>
      <h3 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>iStudio Controls</h3>

      {/* --- Content Section --- */}
      <div style={sectionStyles}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Hero Section</h4>
        <label style={labelStyles}>Logo URL</label>
        <input type="text" name="logoUrl" value={config.sections[0].data.logoUrl || ''} onChange={handleContentChange} style={inputStyles} placeholder="https://..."/>
        <label style={labelStyles}>Main Title</label>
        <input type="text" name="title" value={config.sections[0].data.title || ''} onChange={handleContentChange} style={inputStyles} />
        <label style={labelStyles}>Subtitle</label>
        <input type="text" name="subtitle" value={config.sections[0].data.subtitle || ''} onChange={handleContentChange} style={inputStyles} />

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
      <div style={sectionStyles}><h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Animation</h4><label style={labelStyles}>Transition Speed: {config.animation.duration.toFixed(1)}s</label><input type="range" min="0.5" max="5" step="0.1" value={config.animation.duration} onChange={(e) => updateAnimation('duration', parseFloat(e.target.value))} style={{width: '100%'}}/></div>
      <div style={sectionStyles}><h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Background</h4><div style={checkboxContainerStyles}><input type="checkbox" id="interactive" checked={config.background.interactive} onChange={(e) => handleBackgroundChange('interactive', e.target.checked)}/><label htmlFor="interactive" style={checkboxLabelStyles}>Enable Cursor Effect</label></div><label style={labelStyles}>Particle Color</label><HexColorPicker color={config.background.color} onChange={(newColor) => handleBackgroundChange('color', newColor)}/><label style={{ ...labelStyles, marginTop: '20px' }}>Particle Size: {config.background.size.toFixed(3)}</label><input type="range" min="0.005" max="0.05" step="0.001" value={config.background.size} onChange={(e) => handleBackgroundChange('size', parseFloat(e.target.value))} style={{width: '100%', marginBottom: '20px'}}/><label style={labelStyles}>Particle Count: {config.background.count}</label><input type="range" min="500" max="10000" step="100" value={config.background.count} onChange={(e) => handleBackgroundChange('count', parseInt(e.target.value, 10))} style={{width: '100%'}}/></div>
      <div style={sectionStyles}><button onClick={handleExport} style={exportButtonStyles}>Export Configuration</button></div>
    </div>
  );
};

export default ConfigPanel;
