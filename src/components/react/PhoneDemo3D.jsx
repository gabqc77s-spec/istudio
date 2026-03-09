// src/components/react/PhoneDemo3D.jsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox, TransformControls, useVideoTexture } from '@react-three/drei';
import { editable as e } from '@theatre/r3f';
import * as THREE from 'three';
import useStore from '../../store/useStore';

// Custom Video Material Component
const VideoMaterial = ({ url, isWireframeMode }) => {
  const texture = useVideoTexture(url);
  return (
    <meshBasicMaterial map={texture} toneMapped={false} wireframe={isWireframeMode} />
  );
};

const PhoneDemo3D = ({ position = [1, -1, 3], url = "https://www.eficell.cl" }) => {
  const phoneRef = useRef();
  const [hovered, setHovered] = useState(false);
  const currentSectionIndex = useStore((state) => state.currentSectionIndex);
  const isAdminMode = useStore((state) => state.isAdminMode);
  const dispatchAction = useStore((state) => state.dispatchAction);
  const isWireframeMode = useStore((state) => state.isWireframeMode);
  const qualityLOD = useStore((state) => state.qualityLOD);
  const materialConfig = useStore((state) => state.config.materials?.phone || { color: '#222', metalness: 0.8, roughness: 0.2 });

  // Section index 2 corresponds to "Showcase" in our config.js
  const isShowcaseActive = currentSectionIndex === 2;

  useFrame((state, delta) => {
    if (phoneRef.current) {
      // Idle floating animation
      phoneRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;

      // Target rotation based on hover and active section
      const targetRotationX = isShowcaseActive ? (hovered ? -0.1 : 0) : 0.2;
      const targetRotationY = isShowcaseActive ? (hovered ? -0.1 : -0.2) : 0.5;

      // Smoothly interpolate rotation
      phoneRef.current.rotation.x = THREE.MathUtils.lerp(phoneRef.current.rotation.x, targetRotationX, 0.1);
      phoneRef.current.rotation.y = THREE.MathUtils.lerp(phoneRef.current.rotation.y, targetRotationY, 0.1);

      // Scale up when active in the showcase
      const targetScale = isShowcaseActive ? 1 : 0;
      phoneRef.current.scale.setScalar(THREE.MathUtils.lerp(phoneRef.current.scale.x, targetScale, 0.05));
    }
  });

  // Determine which material to render based on phase 13 settings
  const renderMaterial = () => {
    if (materialConfig.type === 'video' && materialConfig.videoTextureUrl) {
      return <VideoMaterial url={materialConfig.videoTextureUrl} isWireframeMode={isWireframeMode} />;
    }

    if (materialConfig.type === 'glass') {
      return (
        <meshPhysicalMaterial
          color={hovered ? "#fff" : materialConfig.color}
          metalness={0.1}
          roughness={0.05}
          transmission={1} // Glass effect
          thickness={1.5}
          ior={1.5}
          wireframe={isWireframeMode}
        />
      );
    }

    if (materialConfig.type === 'gold') {
      return (
        <meshStandardMaterial
          color={hovered ? "#ffe066" : "#ffd700"}
          metalness={1}
          roughness={0.1}
          wireframe={isWireframeMode}
        />
      );
    }

    // Default 'standard' or fallback
    return (
      <meshStandardMaterial
        color={hovered ? "#333" : materialConfig.color}
        metalness={materialConfig.metalness}
        roughness={materialConfig.roughness}
        wireframe={isWireframeMode} // Debug mode
      />
    );
  };

  const phoneGroup = (
    <e.group
        theatreKey="Eficell Phone 3D"
        ref={phoneRef}
        position={position}
        onPointerOver={() => {
            document.body.style.cursor = 'pointer';
            setHovered(true);
            dispatchAction('hover_phone');
        }}
        onPointerOut={() => {
            document.body.style.cursor = 'auto';
            setHovered(false);
        }}
        onClick={(e) => {
            e.stopPropagation();
            dispatchAction('click_phone'); // Nuevo Trigger que se puede enlazar a abrir Micro-Páginas
        }}
        // Ocultar completamente si está muy pequeño para optimizar
        visible={isShowcaseActive || phoneRef.current?.scale.x > 0.01}
    >
      {/* Phone Body */}
      <RoundedBox
        args={[1.5, 3, 0.1]}
        radius={0.1}
        smoothness={qualityLOD === 'low' ? 1 : 4} // Reduce geometry complexity on low LOD
      >
        {renderMaterial()}
      </RoundedBox>

      {/* Phone Screen (Html Overlay) */}
      <Html
        transform
        position={[0, 0, 0.06]} // Slightly in front of the body
        distanceFactor={1.5}    // Scale the HTML content
        zIndexRange={[100, 0]}  // Ensure it renders correctly in 3D
        style={{
            width: '375px',     // Mobile viewport width
            height: '812px',    // Mobile viewport height
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundColor: '#fff',
            pointerEvents: isShowcaseActive ? 'auto' : 'none' // Only interact when in showcase
        }}
      >
        <iframe
            src={url}
            title="Eficell Demo"
            style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </Html>
    </e.group>
  );

  return isAdminMode ? (
    <TransformControls mode="translate">
      {phoneGroup}
    </TransformControls>
  ) : (
    phoneGroup
  );
};

export default PhoneDemo3D;
