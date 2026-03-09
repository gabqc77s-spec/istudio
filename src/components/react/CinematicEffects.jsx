// src/components/react/CinematicEffects.jsx
import React from 'react';
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import useStore from '../../store/useStore';
import * as THREE from 'three';

const CinematicEffects = () => {
  const ppConfig = useStore((state) => state.config.postprocessing);

  if (!ppConfig || !ppConfig.enabled) return null;

  return (
    <EffectComposer disableNormalPass>
      <Bloom
        luminanceThreshold={ppConfig.bloomLuminanceThreshold}
        luminanceSmoothing={0.9}
        intensity={ppConfig.bloomIntensity}
      />
      <DepthOfField
        focusDistance={ppConfig.dofFocusDistance}
        focalLength={ppConfig.dofFocalLength}
        bokehScale={ppConfig.dofBokehScale}
        height={480}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(ppConfig.chromaticAberrationOffset, ppConfig.chromaticAberrationOffset)}
      />
      <Noise premultiply blendFunction={BlendFunction.ADD} opacity={0.03} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  );
};

export default CinematicEffects;
