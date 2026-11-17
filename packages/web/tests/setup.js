// Configuración común a todos los tests de la web.
import * as domMatchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

// Suma matchers para el DOM, como toBeInTheDocument o toHaveAttribute.
expect.extend(domMatchers);

// Desmonta lo renderizado entre un test y otro.
afterEach(() => {
  cleanup();
});
