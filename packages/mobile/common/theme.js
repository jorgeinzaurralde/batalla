// Tema "retro / pixel" compartido con la web (packages/web/src/retro.css).
// Si cambia un color o una fuente allá, hay que cambiarlo también acá.

export const colors = {
  // Fondo celeste de la web (agua de tablero) y superficies blancas
  background: '#dcf0f5',
  surface: '#ffffff',

  // Tinta: texto y bordes gruesos
  ink: '#173747',
  text: '#173747',
  muted: '#4f6b79',
  border: '#173747',
  grid: '#9fc4cc',

  // Acento y dorado (selección, sombras, resaltados)
  brand: '#07838b',
  brandDark: '#055c62',
  brandLight: '#3cc3c8',
  brandSoft: '#e4f4f4',
  onBrand: '#ffffff',
  gold: '#f2c14e',

  // Tablero
  water: '#f3f7f8',
  ship: '#bce5e9',
  shipBorder: '#173747',

  // Estados
  error: '#b9414c',
  errorSoft: '#f5d3d6',
  hit: '#b85b14',
  hitSoft: '#fff1df',
};

// Esquinas rectas, como en la web.
export const radius = {
  md: 0,
};

// Pixelify Sans para el texto y Press Start 2P para títulos y etiquetas.
// Se cargan en app/_layout.jsx. En Android no se usa fontWeight con fuentes
// propias: cada peso es un archivo distinto.
export const fonts = {
  title: 'PressStart2P_400Regular',
  body: 'PixelifySans_400Regular',
  medium: 'PixelifySans_500Medium',
  semibold: 'PixelifySans_600SemiBold',
  bold: 'PixelifySans_700Bold',
};

// Sombras duras sin desenfoque (boxShadow de React Native, nueva arquitectura).
export const shadow = {
  sm: `3px 3px 0px 0px ${colors.ink}`,
  md: `4px 4px 0px 0px ${colors.ink}`,
  lg: `6px 6px 0px 0px ${colors.ink}`,
  accent: `4px 4px 0px 0px ${colors.brand}`,
  gold: `3px 3px 0px 0px ${colors.gold}`,
  danger: `3px 3px 0px 0px ${colors.error}`,
};

// Al apretar, el botón "se hunde" igual que en la web.
export const pressedStyle = {
  transform: [{ translateX: 3 }, { translateY: 3 }],
  boxShadow: '0px 0px 0px 0px #173747',
};
