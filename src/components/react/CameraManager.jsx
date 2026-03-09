// src/components/react/CameraManager.jsx
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { useCurrentSheet } from "@theatre/r3f";

// --- Configuration ---
const sectionMap = {
  "0,0": { position: { x: 0, y: 0, z: 1.5 }, rotation: { x: 0, y: 0, z: 0 } },   // Hero
  "0,1": { position: { x: -1, y: -1, z: 3 }, rotation: { x: 0.2, y: 0.5, z: 0 } }, // Services
  "1,1": { position: { x: 1, y: -1, z: 3 }, rotation: { x: 0.2, y: -0.5, z: 0 } },  // Showcase
  "-1,1": { position: { x: -1, y: 1, z: 3 }, rotation: { x: -0.2, y: 0.5, z: 0 } }, // Chatbot Demo
  "0,2": { position: { x: 0, y: -2, z: 4 }, rotation: { x: 0.5, y: 0, z: 0 } }  // Android App Demo
};

// TODO: In Phase 3, camera coordinates should also be moved inside the JSON schema (`config.sections`)
// so the visual panel can edit them via Theatre.js, instead of hardcoding a `sectionMap`.
const sectionCoords = Object.keys(sectionMap);

const COOLDOWN_PERIOD = 500;

import useStore from "../../store/useStore";

const CameraManager = ({ animationConfig }) => {
  const { camera } = useThree();
  const currentSectionIndex = useStore((state) => state.currentSectionIndex);
  const setCurrentSectionIndex = useStore((state) => state.setCurrentSectionIndex);
  const lastAnimated = useRef(0);

  const config = useStore((state) => state.config);
  const totalSections = config.sections.length;

  const sheet = useCurrentSheet();

  const moveToSection = (sectionIndex) => {
    const duration = animationConfig.duration;

    // Play the Theatre.js timeline sequence assigned to this section transition.
    // Assuming each section transition takes `duration` seconds in the Theatre.js sequence:
    if (sheet) {
        sheet.sequence.play({ iterationCount: 1, range: [sectionIndex * duration, (sectionIndex + 1) * duration] });
    }

    // Fallback GSAP animation for development safety if Theatre.js isn't configured visually yet
    const coordString = sectionCoords[sectionIndex];
    const targetSection = sectionMap[coordString];
    if (targetSection && !sheet) {
        gsap.to(camera.position, { ...targetSection.position, duration, ease: "power3.inOut" });
        gsap.to(camera.rotation, { ...targetSection.rotation, duration, ease: "power3.inOut" });
    }
  };

  const navigate = (direction) => {
    const now = Date.now();
    const duration = animationConfig.duration;
    if (now - lastAnimated.current < duration * 1000 + COOLDOWN_PERIOD) {
        return;
    }
    lastAnimated.current = now;

    let nextIndex = currentSectionIndex;
    if (direction === 'next') {
        nextIndex = (currentSectionIndex + 1) % totalSections;
    } else {
        nextIndex = (currentSectionIndex - 1 + totalSections) % totalSections;
    }
    setCurrentSectionIndex(nextIndex);
  };
  
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY > 0) navigate('next');
      else navigate('prev');
    };

    const handlePrev = () => navigate('prev');
    const handleNext = () => navigate('next');

    window.addEventListener('wheel', handleWheel);

    // Listen for custom navigation events emitted from Navigation.jsx
    window.addEventListener('navigatePrev', handlePrev);
    window.addEventListener('navigateNext', handleNext);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('navigatePrev', handlePrev);
      window.removeEventListener('navigateNext', handleNext);
    };
  }, [currentSectionIndex, animationConfig]);

  useEffect(() => {
    moveToSection(currentSectionIndex);
  }, [currentSectionIndex, animationConfig]);
  
  useEffect(() => {
    moveToSection(0);
  }, []);

  return null;
};

export default CameraManager;
