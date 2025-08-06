import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface LabelProps {
  children: React.ReactNode;
  style?: any;
  className?: string; // Keep for compatibility but won't be used
}

export function Label({ children, style, ...props }: LabelProps) {
  return (
    <Text style={[styles.label, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827', // var(--color-text-default)
    marginBottom: 4,
  },
});