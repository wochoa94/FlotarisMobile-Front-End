import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string; // Keep for compatibility but won't be used
  style?: any;
}

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string; // Keep for compatibility but won't be used
  style?: any;
}

export function CardHeader({ children, style, ...props }: CardHeaderProps) {
  return (
    <View style={[styles.headerContainer, style]} {...props}>
      {children}
    </View>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string; // Keep for compatibility but won't be used
  style?: any;
}

export function CardBody({ children, style, ...props }: CardBodyProps) {
  return (
    <View style={[styles.bodyContainer, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff', // var(--color-background-alt)
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb', // var(--color-border)
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    // Elevation for Android
    elevation: 2,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // var(--color-border)
  },
  bodyContainer: {
    padding: 20,
  },
});