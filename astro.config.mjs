// @ts-check

import react from '@astrojs/react';
import node from '@astrojs/node';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Enable React to support all 3D and UI components.
  integrations: [
      react(),
	],

  // Enable server-side or hybrid rendering to support API endpoints for saving config
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});