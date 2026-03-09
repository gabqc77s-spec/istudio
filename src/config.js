// src/config.js

const config = {
    content: {
        // Global styling defaults for the active section container
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    sections: [
        {
            id: 'hero',
            type: 'hero',
            coord: '0,0',
            data: {
                logoUrl: '',
                title: 'iStudio Generative',
                subtitle: 'A new dimension of web development.',
                hasTypewriter: true,
            }
        },
        {
            id: 'services',
            type: 'services',
            coord: '0,1',
            data: {
                title: 'Core Services',
                cards: [
                    { title: "AI-Powered Code", description: "Generate robust and efficient code with our advanced AI." },
                    { title: "3D Environments", description: "Create immersive and dynamic 3D worlds for your users." },
                    { title: "Dynamic UI/UX", description: "Design interfaces that adapt, evolve, and feel alive." }
                ]
            }
        },
        {
            id: 'showcase',
            type: 'showcase',
            coord: '1,1',
            data: {
                title: 'Project Showcase',
                subtitle: 'Here we can feature a gallery of 3D projects.'
            }
        },
        {
            id: 'chatbot-demo',
            type: 'widget-demo',
            coord: '-1,1',
            data: {
                title: 'Live Widget Integrations',
                subtitle: 'Experience our AI Chatbot connected to an Android agent app.',
                widget: 'ChatbotWidget',
                widgetProps: {
                    botName: 'Eficell Support',
                    initialMessage: 'Welcome to the live demo. Ask me anything!'
                }
            }
        }
    ],
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
