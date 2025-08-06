// src/theme/logos.ts
export const logos = {
  default: require('../../assets/vite.svg'), // Local asset using require() for React Native
  customerA: 'https://via.placeholder.com/150x50?text=CustomerA+Logo', // Remote URL remains as string
  // Add more logo paths for other themes
};

export type LogoName = keyof typeof logos;