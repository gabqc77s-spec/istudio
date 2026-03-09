// src/components/react/SectionRenderer.jsx
import React from 'react';
import useStore from '../../store/useStore';
import Typewriter from './Typewriter';
import InteractiveCard from './InteractiveCard';

const SectionRenderer = () => {
  const config = useStore((state) => state.config);
  const currentSectionIndex = useStore((state) => state.currentSectionIndex);

  const renderHero = (data) => (
    <div className="content-wrapper">
      <img id="main-logo" src={data.logoUrl} alt="Logo" style={{ display: data.logoUrl ? 'block' : 'none' }} />
      <h1 id="main-title">{data.title}</h1>
      <p id="main-subtitle" className="subtitle">{data.subtitle}</p>
      {data.hasTypewriter && (
        <div className="typewriter-container">
          <span>&gt; </span><Typewriter />
        </div>
      )}
    </div>
  );

  const renderServices = (data) => (
    <div className="content-wrapper">
      <h2>{data.title}</h2>
      <div className="services-grid">
        {data.cards.map((card, idx) => (
          <InteractiveCard key={idx} title={card.title} description={card.description} />
        ))}
      </div>
    </div>
  );

  const renderShowcase = (data) => (
    <div className="content-wrapper">
      <h2>{data.title}</h2>
      <p className="subtitle">{data.subtitle}</p>
    </div>
  );

  return (
    <div className="html-container" style={{ pointerEvents: 'none' }}>
      {config.sections.map((section, index) => {
        const isActive = index === currentSectionIndex;

        return (
          <div
            key={section.id}
            className={`page-section ${isActive ? 'active' : ''}`}
            data-section-coord={section.coord}
            style={{
              justifyContent: config.content.justifyContent,
              alignItems: config.content.alignItems,
              textAlign: config.content.textAlign,
              opacity: isActive ? 1 : 0,
              visibility: isActive ? 'visible' : 'hidden',
              pointerEvents: isActive ? 'auto' : 'none',
              transition: `opacity ${config.animation.duration / 2}s ease-in-out, visibility ${config.animation.duration / 2}s ease-in-out`
            }}
          >
            {section.type === 'hero' && renderHero(section.data)}
            {section.type === 'services' && renderServices(section.data)}
            {section.type === 'showcase' && renderShowcase(section.data)}
          </div>
        );
      })}
    </div>
  );
};

export default SectionRenderer;
