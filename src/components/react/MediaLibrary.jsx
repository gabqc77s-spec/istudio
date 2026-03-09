// src/components/react/MediaLibrary.jsx
import React, { useState, useRef } from 'react';
import useStore from '../../store/useStore';

const MediaLibrary = () => {
  const mediaFiles = useStore((state) => state.config.media || []);
  const addMediaFile = useStore((state) => state.addMediaFile);
  const updateContent = useStore((state) => state.updateContent);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (files) => {
    Array.from(files).forEach(file => {
      // Create a temporary local URL for the file to use in the browser immediately
      const objectUrl = URL.createObjectURL(file);

      const fileType = file.name.endsWith('.glb') || file.name.endsWith('.gltf')
        ? 'model'
        : file.type.startsWith('video/') ? 'video' : 'image';

      const newMedia = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType,
        url: objectUrl, // Simulated upload (would be a real URL from S3/Firebase in production)
      };

      addMediaFile(newMedia);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // Quick Action: Inject media into the website
  const handleMediaClick = (media) => {
    if (media.type === 'image') {
      // Automatically set as Hero Logo for demo purposes
      updateContent('logoUrl', media.url, 'hero');
      alert(`Imagen '${media.name}' inyectada en el Hero como Logo.`);
    } else if (media.type === 'video') {
      // Set as video texture for the 3D phone model
      useStore.getState().updateMaterial('phone', 'videoTextureUrl', media.url);
      useStore.getState().updateMaterial('phone', 'type', 'video');
      alert(`Video '${media.name}' mapeado como textura 3D en el teléfono.`);
    } else if (media.type === 'model') {
      useStore.setState((state) => ({
         config: {
           ...state.config,
           customModelUrl: media.url // We'll use this in SceneClient to load custom GLB
         }
      }));
      alert(`Modelo 3D '${media.name}' cargado en la escena.`);
    }
  };

  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
      <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Media Library</h4>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#9333ea' : 'rgba(255,255,255,0.2)'}`,
          backgroundColor: isDragging ? 'rgba(147, 51, 234, 0.1)' : 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '16px',
          transition: 'all 0.2s ease'
        }}
      >
        <p style={{ fontSize: '13px', margin: 0, opacity: 0.8 }}>
          {isDragging ? "Suelta el archivo aquí..." : "Arrastra imágenes o .glb aquí o haz clic para subir"}
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,video/*,.glb,.gltf"
          multiple
        />
      </div>

      {/* Visual Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {mediaFiles.map((media) => (
          <div
            key={media.id}
            onClick={() => handleMediaClick(media)}
            title={`Clic para usar ${media.name}`}
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {media.type === 'image' ? (
              <img src={media.url} alt={media.name} style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
            ) : (
              <div style={{ width: '100%', height: '60px', backgroundColor: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                {media.type === 'model' ? '📦' : '🎥'}
              </div>
            )}
            <span style={{ fontSize: '10px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
              {media.name}
            </span>
          </div>
        ))}
        {mediaFiles.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '12px', opacity: 0.5, padding: '10px' }}>
            La biblioteca está vacía.
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLibrary;
