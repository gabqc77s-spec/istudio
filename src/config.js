// src/config.js

const config = {
    content: {
        logoUrl: '',
        title: 'iStudio Generative',
        subtitle: 'A new dimension of web development.',
        // NEW: Alignment properties
        justifyContent: 'center', // Vertical: flex-start, center, flex-end
        alignItems: 'center',     // Horizontal: flex-start, center, flex-end
        textAlign: 'center',      // Text align: left, center, right
    },
    animation: {
        duration: 1.5,
    },
    background: {
        color: '#9333ea',
        size: 0.015,
        count: 5000,
        interactive: true,
    },
};

export default config;
