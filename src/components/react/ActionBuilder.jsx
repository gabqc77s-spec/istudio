// src/components/react/ActionBuilder.jsx
import React, { useState } from 'react';
import useStore from '../../store/useStore';

const TRIGGERS = [
  { id: 'click_logo', label: 'Click en el Logo' },
  { id: 'enter_showcase', label: 'Al entrar a Project Showcase' },
  { id: 'hover_phone', label: 'Al pasar el mouse por el Teléfono 3D' },
  { id: 'click_phone', label: 'Al hacer CLIC en el Teléfono 3D' },
  { id: 'scroll_50', label: 'Al scrollear el 50% (Camera Event)' } // Phase 11 Scroll Trigger simulation
];

const ACTIONS = [
  { id: 'set_particles_red', label: 'Cambiar Partículas a Rojo' },
  { id: 'set_particles_blue', label: 'Cambiar Partículas a Azul' },
  { id: 'navigate_start', label: 'Volver al Inicio' },
  { id: 'open_modal_contact', label: 'Abrir Micro-Página: Contacto' },
  { id: 'open_modal_project', label: 'Abrir Micro-Página: Proyecto' },
  { id: 'explode_model', label: 'Explotar Modelo 3D (Simulado)' }
];

const ActionBuilder = () => {
  const actionsConfig = useStore((state) => state.config.actions || []);
  const setConfig = useStore((state) => state.setConfig);
  const config = useStore((state) => state.config);

  const [newTrigger, setNewTrigger] = useState(TRIGGERS[0].id);
  const [newAction, setNewAction] = useState(ACTIONS[0].id);

  const handleAddRule = () => {
    const newRule = { id: Date.now().toString(), trigger: newTrigger, action: newAction };
    setConfig({
      ...config,
      actions: [...actionsConfig, newRule]
    });
  };

  const handleRemoveRule = (idToRemove) => {
    setConfig({
      ...config,
      actions: actionsConfig.filter(rule => rule.id !== idToRemove)
    });
  };

  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
      <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Eventos y Nodos (Action Builder)</h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '10px', opacity: 0.7, marginBottom: '4px' }}>CUANDO (Trigger)</label>
                <select value={newTrigger} onChange={(e) => setNewTrigger(e.target.value)} style={{ width: '100%', padding: '6px', backgroundColor: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}>
                    {TRIGGERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '10px', opacity: 0.7, marginBottom: '4px' }}>HACER (Action)</label>
                <select value={newAction} onChange={(e) => setNewAction(e.target.value)} style={{ width: '100%', padding: '6px', backgroundColor: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}>
                    {ACTIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
            </div>
        </div>
        <button onClick={handleAddRule} style={{ padding: '8px', backgroundColor: '#9333ea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Añadir Regla Lógica
        </button>
      </div>

      {/* Lista de reglas activas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {actionsConfig.length === 0 && <span style={{ fontSize: '12px', opacity: 0.5, textAlign: 'center' }}>Sin reglas definidas.</span>}
          {actionsConfig.map(rule => {
              const tLabel = TRIGGERS.find(t => t.id === rule.trigger)?.label || rule.trigger;
              const aLabel = ACTIONS.find(a => a.id === rule.action)?.label || rule.action;
              return (
                  <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ color: '#a3a3a3' }}>Si: <strong style={{ color: 'white' }}>{tLabel}</strong></span>
                          <span style={{ color: '#4ade80' }}>Haz: <strong>{aLabel}</strong></span>
                      </div>
                      <button onClick={() => handleRemoveRule(rule.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                  </div>
              )
          })}
      </div>
    </div>
  );
};

export default ActionBuilder;
