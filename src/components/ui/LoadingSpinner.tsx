import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string; // Keep for compatibility but won't be used
  text?: string;
  color?: string;
}

const sizeMap = {
  sm: 'small' as const,
  md: 'large' as const,
  lg: 'large' as const,
};

export function LoadingSpinner({ 
  size = 'md', 
  text, 
  color = '#2563eb',
  ...props 
}: LoadingSpinnerProps) {
  if (text) {
    return (
      <View style={styles.containerWithText}>
        <ActivityIndicator 
          size={sizeMap[size]} 
          color={color}
        />
        <Text style={styles.text}>{text}</Text>
      </View>
    );
  }
  
  return (
    <ActivityIndicator 
      size={sizeMap[size]} 
      color={color}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  containerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280', // text-gray-600
  },
});