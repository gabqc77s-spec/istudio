// @ts-check

import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Enable React to support all 3D and UI components.
  integrations: [
      react(),
	],

  vite: {
    plugins: [tailwindcss()],
  },
});