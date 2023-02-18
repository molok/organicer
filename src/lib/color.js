// Interpolates between two colors.
// colorA and colorB should be objects with keys {r, g, b, a}.
// interpolationFactor should be a number between 0 and 1 representing how far from colorA to
// colorB it should interpolate.
// An object with keys {r, g, b, a} will be returned.
export const interpolateColors = (colorA, colorB, interpolationFactor) => {
  return {
    r: parseInt((colorB.r - colorA.r) * interpolationFactor + colorA.r, 10),
    g: parseInt((colorB.g - colorA.g) * interpolationFactor + colorA.g, 10),
    b: parseInt((colorB.b - colorA.b) * interpolationFactor + colorA.b, 10),
    a: (colorB.a - colorA.a) * interpolationFactor + colorA.a,
  };
};

export const rgbaObject = (r, g, b, a) => {
  return { r, g, b, a };
};

export const rgbaString = (rgba) => {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
};

// assumes var is either a longform-hex or rgb(a) color value
export const readRgbaVariable = (varName) => {
  const varValue = getComputedStyle(document.documentElement).getPropertyValue(varName);
  if (varValue.charAt(0) === '#') {
    const hexValue = varValue.substring(1, 7);
    return rgbaObject(
      parseInt(hexValue.substring(0, 2), 16),
      parseInt(hexValue.substring(2, 4), 16),
      parseInt(hexValue.substring(4, 6), 16),
      1
    );
  } else {
    const rgbaValues = [...varValue.matchAll(/[0-9.]+/g)].map((a) => +a[0]);
    if (rgbaValues.length === 3) {
      return rgbaObject(...rgbaValues, 0);
    } else if (rgbaValues.length === 4) {
      return rgbaObject(...rgbaValues);
    } else {
      return rgbaObject(0, 0, 0, 0);
    }
  }
};

const themes = {
  One: {
    Light: {
      /*
        adaptation of atom one light theme
        https://github.com/atom/atom/tree/master/packages/one-light-ui
      */
      // background and highlights
      '--base03': '#383A42',
      '--base02': '#585A5F',
      '--base01': '#79797C',
      '--base00': '#999999',
      '--base0': '#A0A1A7',
      '--base1': '#C0C0C4',
      '--base2': '#DFE0E2',
      '--base3': '#FFFFFF',
      // transparent versions
      '--base0-soft': 'rgba(160, 161, 167, 0.75)',
      '--base1-soft': 'rgba(192, 192, 196, 0.4)',
      // header colors
      '--blue': '#1492ff',
      '--green': '#2db448',
      '--cyan': '#D831B0', // pink
      '--yellow': '#d5880b',
      // additional colors
      '--orange': '#f42a2a', //red
      '--red': '#f42a2a',
      '--magenta': 'hsl(208, 100%, 56%)', // blue
      '--violet': '#D831B0', // pink
      // table highlight
      '--green-soft': 'rgba(133, 153, 0, 0.28)',
    },
    Dark: {
      /*
        adaptation of atom one dark theme
        https://github.com/atom/atom/tree/master/packages/one-dark-ui
      */
      // background and highlights
      '--heading1': '#51AFEF',
      '--heading2': '#c678dd',
      '--heading3': '#a9a1e1',
      '--heading4': '#7cc3f3',
      '--heading5': '#d499e5',
      '--heading6': '#a8d7f7',
      '--heading7': '#e2bbee',
      '--heading8': '#dceffb',
      '--base03': '#abb2bf',
      '--base02': '#9198A5',
      '--base01': '#767D8A',
      '--base00': '#bbc2cf',
      '--base0': '#4c5263',
      '--base1': '#404553',
      '--base2': '#1D2026',
      '--base3': '#282c34',
      // transparent versions
      '--base0-soft': 'rgba(20, 22, 26, 0.75)',
      '--base1-soft': 'rgba(20, 22, 26, 0.4)',
      // header colors
      '--blue': '#51AFEF',
      '--green': '#787E7E',
      '--cyan': 'rgb(204, 133, 51)', //orange
      '--yellow': 'rgb(226, 192, 141)',
      // additional colors
      '--orange': '#8B8811', //red
      '--red': '#D831B0', //pink
      '--magenta': 'rgb(0, 136, 255)', //blue
      '--violet': '#d33682',
      // table highlight
      '--green-soft': 'rgba(133, 153, 0, 0.28)'
    },
  },
};

export const loadTheme = (theme = 'One', colorScheme = 'Dark') => {
  if (colorScheme === 'OS') {
    const osPreference = window.matchMedia('(prefers-color-scheme: dark)');
    if ('matches' in osPreference) {
      colorScheme = osPreference.matches ? 'Dark' : 'Light';
    } else {
      colorScheme = 'Light';
    }
  }
  const style = document.documentElement.style;
  Object.entries(themes[theme][colorScheme]).forEach(([k, v]) => style.setProperty(k, v));

  // set theme color on android
  document
    .querySelector('meta[name="theme-color"]')
    .setAttribute('content', themes[theme]['--base3']);
};

const fake = {
  bg: "#282c34",
  fg: "#bbc2cf",
  bgalt: "#21242b",
  fgalt: "#5B6268",
  base0: "#1B2229",
  base1: "#1c1f24",
  base2: "#202328",
  base3: "#23272e",
  base4: "#3f444a",
  base5: "#5B6268",
  base6: "#73797e",
  base7: "#9ca0a4",
  base8: "#DFDFDF",
  red: "#ff6c6b",
  orange: "#da8548",
  green: "#98be65",
  teal: "#4db5bd",
  yellow: "#ECBE7B",
  blue: "#51afef",
  darkblue: "#2257A0",
  magenta: "#c678dd",
  violet: "#a9a1e1",
  cyan: "#46D9FF",
  darkcyan: "#5699AF",
  x: "#7CC3F3"
}
