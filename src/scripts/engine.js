import { snippets } from '../content/snippets.js';

// --- Typewriter Effect ---
async function typeWriter(element, text, speed) {
  return new Promise(resolve => {
    let i = 0;
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    }
    type();
  });
}

async function startTypewriterSequence(element, phrases, phraseSpeed, wordSpeed) {
    if (!element) return; // Exit if element doesn't exist
    element.innerHTML = ''; // Clear previous content
    
    // Indefinite loop
    while (true) {
        for (let i = 0; i < phrases.length; i++) {
            await typeWriter(element, phrases[i], phraseSpeed);
            await new Promise(resolve => setTimeout(resolve, wordSpeed)); // Pause between phrases
            if (i < phrases.length - 1) {
                element.innerHTML = ''; // Clear for next phrase
            }
        }
        element.innerHTML = ''; // Clear at the end of the loop to restart
    }
}


// --- Initialization ---
function init() {
  console.log("iStudio Engine: Initializing enhancements...");
  
  const typewriterElement = document.getElementById('typewriter');
  startTypewriterSequence(typewriterElement, snippets.ai, 50, 1500);
  
  console.log("iStudio Engine: Enhancements ready.");
}

// --- Run ---
document.addEventListener('DOMContentLoaded', init);
