import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface LogoProps {
  style?: any;
  className?: string; // Keep for compatibility but won't be used
}

export function Logo({ style }: LogoProps) {
  const { logoUrl } = useTheme();

  // Handle both local assets and remote URLs
  const imageSource = typeof logoUrl === 'string' && logoUrl.startsWith('http') 
    ? { uri: logoUrl }
    : require('../../assets/vite.svg'); // Fallback to local asset

  return (
    <Image 
      source={imageSource}
      style={[styles.logo, style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 32,
    height: 32,
  },
});