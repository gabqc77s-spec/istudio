// src/components/react/SceneClient.jsx
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Stats } from '@react-three/drei';
import CameraManager from './CameraManager';
import ConfigPanel from './ConfigPanel';
import SectionRenderer from './SectionRenderer';
import PhoneDemo3D from './PhoneDemo3D';
import DynamicModel from './DynamicModel';
import DeviceSimulator from './DeviceSimulator';
import MicroPageModal from './MicroPageModal';
import CinematicEffects from './CinematicEffects';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import { Physics } from '@react-three/rapier';

// THEATRE.JS IMPORTS (SAFE HERE BECAUSE THIS FILE IS CLIENT-ONLY)
import { getProject } from '@theatre/core';
import { SheetProvider } from '@theatre/r3f';
import studio from '@theatre/studio';

// Initialize Theatre.js
studio.initialize();
const theatreProject = getProject('Impulsa Showroom');
const mainSheet = theatreProject.sheet('Main Scene');

function Starfield({ count, color, size, interactive, mousePos }) {
  const pointsRef = useRef();
  const radius = 5;
  const isTimePaused = useStore((state) => state.isTimePaused);

  const initialPositions = React.useMemo(() => {
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
    if (pointsRef.current && !isTimePaused) {
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

const SceneClient = () => {
  const mousePos = useRef(new THREE.Vector3(0,0,0));
  const config = useStore((state) => state.config);
  const isAdminMode = useStore((state) => state.isAdminMode);
  const toggleAdminMode = useStore((state) => state.toggleAdminMode);
  const [debouncedConfig, setDebouncedConfig] = React.useState(config.background);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedConfig(config.background), 250);
    return () => clearTimeout(handler);
  }, [config.background]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        toggleAdminMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleAdminMode]);

  // Show/Hide Theatre Studio UI based on Admin Mode
  useEffect(() => {
    if (isAdminMode) {
      studio.ui.restore();
    } else {
      studio.ui.hide();
    }
  }, [isAdminMode]);

  const handlePointerMove = (event) => {
    // Safety check: ensure camera is fully initialized before unprojecting
    if (!event.camera || !event.camera.projectionMatrixInverse) return;

    const vec = new THREE.Vector3();
    // Normalize coordinates based on the pointer event inside the canvas
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;

    vec.set(x, y, 0.5);
    vec.unproject(event.camera);
    const dir = vec.sub(event.camera.position).normalize();
    const distance = -event.camera.position.z / dir.z;
    mousePos.current.copy(event.camera.position).add(dir.multiplyScalar(distance));
  };

  return (
    <>
      {isAdminMode && <ConfigPanel />}
      {isAdminMode && (
        <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000, background: '#9333ea', padding: '5px 10px', borderRadius: '4px', color: 'white', fontWeight: 'bold', pointerEvents: 'none' }}>
          MODO EDICIÓN ACTIVO
        </div>
      )}

      {/* Fase 10: Performance Auditing Tools */}
      {isAdminMode && <Stats showPanel={0} className="stats-panel" />}

      <DeviceSimulator>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <React.Suspense fallback={null}>
          <Canvas
              camera={{ position: [0, 0, 1.5], fov: 75 }}
              onPointerMove={handlePointerMove}
          >
              <SheetProvider sheet={mainSheet}>
                  <ambientLight intensity={config.lighting?.ambientIntensity || 0.5} />
                  <spotLight
                    position={[10, 10, 10]}
                    angle={0.15}
                    penumbra={1}
                    intensity={config.lighting?.spotlightIntensity || 1.5}
                    color={config.lighting?.spotlightColor || '#ffffff'}
                    castShadow
                  />
                  <Starfield key={debouncedConfig.count} {...debouncedConfig} mousePos={mousePos} />
                  <CameraManager animationConfig={config.animation} />

                  {/* Phase 14: Physics Engine wrapper */}
                  <React.Suspense fallback={null}>
                    {config.physics?.enabled ? (
                      <Physics debug={config.physics?.debug} gravity={config.physics?.gravity || [0, -9.81, 0]}>
                        {/* Showcase Device (Eficell Demo) */}
                        <PhoneDemo3D position={[1, -1, 3]} url="https://www.eficell.cl" />
                        {/* Dynamically loaded models from Media Library */}
                        <DynamicModel position={[-1, 0, 1]} />
                      </Physics>
                    ) : (
                      <>
                        <PhoneDemo3D position={[1, -1, 3]} url="https://www.eficell.cl" />
                        <DynamicModel position={[-1, 0, 1]} />
                      </>
                    )}
                  </React.Suspense>

                {/* Phase 12: Cinematic Post-Processing */}
                <CinematicEffects />

              </SheetProvider>
          </Canvas>
        </React.Suspense>
      </div>

      <SectionRenderer />
      <MicroPageModal />
      </DeviceSimulator>
    </>
  );
};

export default SceneClient;
