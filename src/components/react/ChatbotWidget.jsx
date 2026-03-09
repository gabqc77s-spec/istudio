// src/components/react/ChatbotWidget.jsx
import React, { useState, useRef, useEffect } from 'react';

const ChatbotWidget = ({ botName = "ImpulsaBot", initialMessage = "¡Hola! ¿En qué podemos ayudarte hoy?" }) => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: initialMessage }]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: 'user', text: inputValue }];
    setMessages(newMessages);
    setInputValue('');

    // Simulate bot response after a delay
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        sender: 'bot',
        text: `Esta es una demo en vivo de un Chatbot conectado. En producción, esto enviaría el mensaje: "${inputValue}" a su aplicación de Android de Eficell.`
      }]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#9333ea',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            pointerEvents: 'auto'
        }}
      >
        💬
      </button>
    );
  }

  return (
    <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '320px',
        height: '450px',
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        zIndex: 1000,
        pointerEvents: 'auto',
        fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{
          backgroundColor: '#9333ea',
          padding: '16px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold'
      }}>
          <span>{botName}</span>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}
          >
              ✕
          </button>
      </div>

      {/* Messages Area */}
      <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
      }}>
          {messages.map((msg, idx) => (
              <div key={idx} style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === 'user' ? '#9333ea' : '#333',
                  color: 'white',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  fontSize: '14px',
                  lineHeight: '1.4'
              }}>
                  {msg.text}
              </div>
          ))}
          <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
          padding: '12px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          gap: '8px'
      }}>
          <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#333',
                  color: 'white',
                  outline: 'none'
              }}
          />
          <button
              onClick={handleSend}
              style={{
                  backgroundColor: '#9333ea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 16px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
              }}
          >
              Enviar
          </button>
      </div>
    </div>
  );
};

export default ChatbotWidget;
