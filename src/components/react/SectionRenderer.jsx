// src/components/react/SectionRenderer.jsx
import React from 'react';
import useStore from '../../store/useStore';
import ReactContentEditable from 'react-contenteditable';
import Typewriter from './Typewriter';
import InteractiveCard from './InteractiveCard';
import ChatbotWidget from './ChatbotWidget';

// Widget Registry Map
const WidgetRegistry = {
  ChatbotWidget: ChatbotWidget,
  // Add more widgets here in the future
};

const SectionRenderer = () => {
  const config = useStore((state) => state.config);
  const currentSectionIndex = useStore((state) => state.currentSectionIndex);
  const isAdminMode = useStore((state) => state.isAdminMode);
  const updateContent = useStore((state) => state.updateContent);

  const handleTitleChange = (e) => {
    // Phase 5: Inline editing updates the store immediately
    updateContent('title', e.target.value);
  };

  const handleSubtitleChange = (e) => {
    updateContent('subtitle', e.target.value);
  };

  const renderHero = (data) => {
    // Workaround for default export differences in SSR/CJS
    const ContentEditable = ReactContentEditable.default || ReactContentEditable;

    return (
      <div className="content-wrapper">
        <img id="main-logo" src={data.logoUrl} alt="Logo" style={{ display: data.logoUrl ? 'block' : 'none' }} />
        <ContentEditable
          html={data.title}
          disabled={!isAdminMode}
          onChange={handleTitleChange}
          tagName="h1"
          style={{
            outline: isAdminMode ? '2px dashed #9333ea' : 'none',
            cursor: isAdminMode ? 'text' : 'default',
            padding: isAdminMode ? '4px' : '0'
          }}
        />
        <ContentEditable
          html={data.subtitle}
          disabled={!isAdminMode}
          onChange={handleSubtitleChange}
          tagName="p"
          className="subtitle"
          style={{
            outline: isAdminMode ? '2px dashed #9333ea' : 'none',
            cursor: isAdminMode ? 'text' : 'default',
            padding: isAdminMode ? '4px' : '0'
          }}
        />
        {data.hasTypewriter && (
          <div className="typewriter-container">
            <span>&gt; </span><Typewriter />
          </div>
        )}
      </div>
    );
  };

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

  const renderWidgetDemo = (data) => {
    const WidgetComponent = WidgetRegistry[data.widget];
    return (
      <div className="content-wrapper">
        <h2>{data.title}</h2>
        <p className="subtitle">{data.subtitle}</p>
        <div style={{ marginTop: '2rem' }}>
          {WidgetComponent ? <WidgetComponent {...data.widgetProps} /> : <p>Widget not found</p>}
        </div>
      </div>
    );
  };

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
            {section.type === 'widget-demo' && renderWidgetDemo(section.data)}
          </div>
        );
      })}
    </div>
  );
};

export default SectionRenderer;
