// src/components/react/PhoneDemo3D.jsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import { editable as e } from '@theatre/r3f';
import * as THREE from 'three';
import useStore from '../../store/useStore';

const PhoneDemo3D = ({ position = [1, -1, 3], url = "https://www.eficell.cl" }) => {
  const phoneRef = useRef();
  const [hovered, setHovered] = useState(false);
  const currentSectionIndex = useStore((state) => state.currentSectionIndex);

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

  return (
    <e.group
        theatreKey="Eficell Phone 3D"
        ref={phoneRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        // Ocultar completamente si está muy pequeño para optimizar
        visible={isShowcaseActive || phoneRef.current?.scale.x > 0.01}
    >
      {/* Phone Body */}
      <RoundedBox args={[1.5, 3, 0.1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={hovered ? "#333" : "#222"} metalness={0.8} roughness={0.2} />
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
};

export default PhoneDemo3D;
