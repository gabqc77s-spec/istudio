// src/components/react/Scene.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import CameraManager from './CameraManager';
import ConfigPanel from './ConfigPanel';
import SectionRenderer from './SectionRenderer';
import PhoneDemo3D from './PhoneDemo3D';
import * as THREE from 'three';
import useStore from '../../store/useStore';

function Starfield({ count, color, size, interactive, mousePos }) {
  const pointsRef = useRef();
  const radius = 5;

  const initialPositions = useMemo(() => {
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const r = radius * Math.cbrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        points.set([x, y, z], i * 3);
    }
    return points;
  }, [count, radius]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
        pointsRef.current.rotation.x += delta / 20;
        pointsRef.current.rotation.y += delta / 25;
    }
    
    const geometry = pointsRef.current?.geometry;
    if (!geometry) return;

    const positions = geometry.attributes.position.array;

    if (interactive && mousePos.current) {
        const target = mousePos.current;
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const p = new THREE.Vector3(initialPositions[i3], initialPositions[i3 + 1], initialPositions[i3 + 2]);
            const distance = p.distanceTo(target);
            
            let force = 0;
            const maxDistance = 0.5;
            if (distance < maxDistance) {
                force = (1 - (distance / maxDistance)) * -0.5;
            }
            positions[i3 + 2] = initialPositions[i3 + 2] + force;
        }
    } else {
        if (positions[2] !== initialPositions[2]) {
             positions.set(initialPositions);
        }
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={initialPositions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color={color} size={size} sizeAttenuation={true} depthWrite={false} />
    </Points>
  );
};

const Scene = ({ children }) => {
  const [showPanel, setShowPanel] = useState(false);
  const mousePos = useRef(new THREE.Vector3(0,0,0));

  // Utilizando el Estado Global (Zustand)
  const config = useStore((state) => state.config);

  const [debouncedConfig, setDebouncedConfig] = useState(config.background);

  // Debounce para evitar recalcular la geometría de partículas con cada letra escrita en el panel
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedConfig(config.background), 250);
    return () => clearTimeout(handler);
  }, [config.background]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fondo') === '123') setShowPanel(true);
  }, []);

  const handlePointerMove = (event) => {
    const vec = new THREE.Vector3();
    vec.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vec.unproject(event.camera);
    const dir = vec.sub(event.camera.position).normalize();
    const distance = -event.camera.position.z / dir.z;
    mousePos.current.copy(event.camera.position).add(dir.multiplyScalar(distance));
  };

  return (
    <>
      {showPanel && <ConfigPanel />}
      <Canvas 
        camera={{ position: [0, 0, 1.5], fov: 75 }}
        onPointerMove={handlePointerMove}
      >
        <ambientLight intensity={0.5} />
        <Starfield key={debouncedConfig.count} {...debouncedConfig} mousePos={mousePos} />
        <CameraManager animationConfig={config.animation} />

        {/* Showcase Device (Eficell Demo) */}
        <PhoneDemo3D position={[1, -1, 3]} url="https://www.eficell.cl" />
      </Canvas>
      <SectionRenderer />
    </>
  );
};

export default Scene;
