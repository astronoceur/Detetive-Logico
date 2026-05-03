/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        azul: {
          escuro: '#1A2533',
          medio: '#2D3E50',
          profundo: '#1F3864',
          medio2: '#4A5568',
          claro: '#60A5FA',
          clarissimo: '#93C5FD',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui'],
        titulo: ['Caveat', 'cursive'],
      },
      borderRadius: {
        dialog: '16px',
      },
    },
  },
  plugins: [],
}
