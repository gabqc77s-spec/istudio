// src/components/react/Navigation.jsx
import React from 'react';

const Navigation = () => {
  const handlePrev = () => window.dispatchEvent(new Event('navigatePrev'));
  const handleNext = () => window.dispatchEvent(new Event('navigateNext'));

  return (
    <div className="mobile-nav">
      <button onClick={handlePrev} className="nav-button">Prev</button>
      <button onClick={handleNext} className="nav-button">Next</button>
    </div>
  );
};

export default Navigation;
