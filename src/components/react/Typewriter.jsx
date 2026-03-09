// src/components/react/Typewriter.jsx
import React, { useState, useEffect } from 'react';
import { snippets } from '../../content/snippets.js';

const Typewriter = ({ speed = 50, pause = 1500 }) => {
  const [text, setText] = useState('');
  const phrases = snippets.ai;

  useEffect(() => {
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timer;
    let isMounted = true;

    const handleTyping = () => {
      if (!isMounted) return;
      const currentPhrase = phrases[currentPhraseIndex];

      if (!isDeleting && currentCharIndex < currentPhrase.length) {
        // Typing
        setText((prev) => prev + currentPhrase.charAt(currentCharIndex));
        currentCharIndex++;
        timer = setTimeout(handleTyping, speed);
      } else if (!isDeleting && currentCharIndex === currentPhrase.length) {
        // End of phrase, pause
        timer = setTimeout(() => {
          isDeleting = true;
          handleTyping();
        }, pause);
      } else if (isDeleting && currentCharIndex > 0) {
        // Deleting
        setText((prev) => prev.slice(0, -1));
        currentCharIndex--;
        timer = setTimeout(handleTyping, speed / 2);
      } else if (isDeleting && currentCharIndex === 0) {
        // Switch phrase
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        timer = setTimeout(handleTyping, speed);
      }
    };

    timer = setTimeout(handleTyping, speed);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [phrases, speed, pause]);

  return <span>{text}</span>;
};

export default Typewriter;