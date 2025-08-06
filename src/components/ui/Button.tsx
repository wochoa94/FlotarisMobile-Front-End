import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  className?: string; // Keep for compatibility but won't be used
}

export function Button({ 
  variant = 'primary', 
  children, 
  onPress, 
  disabled = false,
  style,
  ...props 
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: [styles.baseContainer, styles.primaryContainer],
          text: [styles.baseText, styles.primaryText],
        };
      case 'secondary':
        return {
          container: [styles.baseContainer, styles.secondaryContainer],
          text: [styles.baseText, styles.secondaryText],
        };
      case 'danger':
        return {
          container: [styles.baseContainer, styles.dangerContainer],
          text: [styles.baseText, styles.dangerText],
        };
      default:
        return {
          container: [styles.baseContainer, styles.primaryContainer],
          text: [styles.baseText, styles.primaryText],
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        variantStyles.container,
        disabled && styles.disabledContainer,
        style
      ]}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={[
        variantStyles.text,
        disabled && styles.disabledText
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    // Elevation for Android
    elevation: 2,
  },
  baseText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Primary variant
  primaryContainer: {
    backgroundColor: '#2563eb', // var(--color-primary)
    borderColor: 'transparent',
  },
  primaryText: {
    color: 'white',
  },
  // Secondary variant
  secondaryContainer: {
    backgroundColor: '#ffffff', // var(--color-background-alt)
    borderColor: '#d1d5db', // var(--color-input-border)
  },
  secondaryText: {
    color: '#6b7280', // var(--color-text-secondary)
  },
  // Danger variant
  dangerContainer: {
    backgroundColor: '#ef4444', // var(--color-danger)
    borderColor: 'transparent',
  },
  dangerText: {
    color: 'white',
  },
  // Disabled state
  disabledContainer: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});