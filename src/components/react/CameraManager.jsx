// src/components/react/CameraManager.jsx
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

// --- Configuration ---
const sectionMap = {
  "0,0": { position: { x: 0, y: 0, z: 1.5 }, rotation: { x: 0, y: 0, z: 0 } },   // Hero
  "0,1": { position: { x: -1, y: -1, z: 3 }, rotation: { x: 0.2, y: 0.5, z: 0 } }, // Services
  "1,1": { position: { x: 1, y: -1, z: 3 }, rotation: { x: 0.2, y: -0.5, z: 0 } }  // Showcase
};
const sectionCoords = Object.keys(sectionMap);

const COOLDOWN_PERIOD = 500;

const CameraManager = ({ animationConfig }) => {
  const { camera } = useThree();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const lastAnimated = useRef(0);

  const moveToSection = (sectionIndex) => {
    const coordString = sectionCoords[sectionIndex];
    const targetSection = sectionMap[coordString];
    if (!targetSection) return;

    const duration = animationConfig.duration;

    gsap.to(camera.position, { ...targetSection.position, duration, ease: "power3.inOut" });
    gsap.to(camera.rotation, { ...targetSection.rotation, duration, ease: "power3.inOut" });

    // TODO: This direct DOM manipulation will be removed in Phase 2 when Zustand controls CSS visibility.
    // For now, it must remain to prevent all sections from overlapping visibly on screen.
    document.querySelectorAll('.page-section').forEach((el) => {
      gsap.to(el, {
        autoAlpha: el.dataset.sectionCoord === coordString ? 1 : 0, 
        duration: duration / 2,
        ease: "power2.inOut"
      });
    });
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
        nextIndex = (currentSectionIndex + 1) % sectionCoords.length;
    } else {
        nextIndex = (currentSectionIndex - 1 + sectionCoords.length) % sectionCoords.length;
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
