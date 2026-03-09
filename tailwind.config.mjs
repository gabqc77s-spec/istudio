/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Syncopate', 'sans-serif'],
      },
      colors: {
        background: '#0a0a0a',
        surface: '#121212',
        border: '#262626',
        accent: '#3b82f6',
        neon: '#e92a67',
      }
    },
  },
  plugins: [],
}
