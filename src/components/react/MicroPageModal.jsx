// src/components/react/MicroPageModal.jsx
import React from 'react';
import useStore from '../../store/useStore';

const MicroPageModal = () => {
  const activeMicroPage = useStore((state) => state.activeMicroPage);
  const setActiveMicroPage = useStore((state) => state.setActiveMicroPage);

  if (!activeMicroPage) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      opacity: activeMicroPage ? 1 : 0,
      transition: 'opacity 0.4s ease-in-out',
      pointerEvents: 'auto'
    }}>
      <div style={{
        backgroundColor: '#111',
        border: '1px solid rgba(147, 51, 234, 0.4)',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 0 40px rgba(147, 51, 234, 0.2)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button
            onClick={() => setActiveMicroPage(null)}
            style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                opacity: 0.6
            }}
        >
            ✕
        </button>

        {activeMicroPage === 'contact' && (
          <>
            <h2 style={{ margin: '0 0 20px 0', color: 'white' }}>Contacto Inmersivo</h2>
            <p style={{ color: '#a3a3a3', marginBottom: '20px' }}>Esta es una Micro-Página (Modal) cargada sin cambiar la URL ni recargar.</p>
            <input type="text" placeholder="Email" style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white' }} />
            <textarea placeholder="Mensaje" rows={4} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: 'white', resize: 'none' }}></textarea>
            <button style={{ width: '100%', padding: '14px', backgroundColor: '#9333ea', border: 'none', color: 'white', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>Enviar Mensaje</button>
          </>
        )}

        {activeMicroPage === 'project_details' && (
          <>
            <h2 style={{ margin: '0 0 10px 0', color: 'white' }}>Detalles del Proyecto</h2>
            <h3 style={{ margin: '0 0 20px 0', color: '#9333ea' }}>Eficell App & Web</h3>
            <p style={{ color: '#a3a3a3', lineHeight: '1.6' }}>
              Este sistema incluye un Chatbot omnicanal, integración con Android y gestión B2B. Todo configurado como una Micro-Página para mantener al usuario dentro de la experiencia 3D.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default MicroPageModal;
