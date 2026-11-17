import { defineConfig } from 'vitest/config';

// Los tests prueban la lógica de common/, que es JavaScript puro (sin
// React Native), así que corren en Node sin emulador.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
