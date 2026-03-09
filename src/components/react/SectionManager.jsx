// src/components/react/SectionManager.jsx
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useStore from '../../store/useStore';

const SectionManager = () => {
  const sections = useStore((state) => state.config.sections);
  const reorderSections = useStore((state) => state.reorderSections);

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
        return;
    }

    reorderSections(result.source.index, result.destination.index);
  };

  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
      <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Page Sections (Drag & Drop)</h4>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {sections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: 'none',
                        padding: '12px',
                        margin: '0 0 4px 0',
                        backgroundColor: snapshot.isDragging ? '#9333ea' : 'rgba(0,0,0,0.3)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        cursor: 'grab',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        ...provided.draggableProps.style,
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{section.id.toUpperCase()}</span>
                      <span style={{ fontSize: '10px', opacity: 0.6, background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>
                          {section.type}
                      </span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SectionManager;
