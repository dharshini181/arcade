// Brand palette (strict): #FF69B4 #FF1493 #FF00FF #FF4500 #FFD700
// Neutrals: night/panel (very dark magenta-black) and snow (near-white) are used only for surfaces and text.
const c = {
  hot: '#FF69B4', deep: '#FF1493', mag: '#FF00FF', fire: '#FF4500', gold: '#FFD700',
  night: '#12000F', panel: '#1F0526', panel2: '#31093D', snow: '#FFF4FA', ink: '#12000F'
};
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: c,
      fontFamily: {
        display: ['Bungee', 'Impact', 'system-ui', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'ui-monospace', 'monospace'],
        body: ['Rubik', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
