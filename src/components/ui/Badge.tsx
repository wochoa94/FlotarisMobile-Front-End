import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  type: 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'blue' | 'purple' | 'red' | 'green' | 'yellow' | 'orange';
  label: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const typeConfig = {
  success: {
    containerStyle: styles.successContainer,
    textStyle: styles.successText,
  },
  warning: {
    containerStyle: styles.warningContainer,
    textStyle: styles.warningText,
  },
  danger: {
    containerStyle: styles.dangerContainer,
    textStyle: styles.dangerText,
  },
  info: {
    containerStyle: styles.infoContainer,
    textStyle: styles.infoText,
  },
  gray: {
    containerStyle: styles.grayContainer,
    textStyle: styles.grayText,
  },
  blue: {
    containerStyle: styles.blueContainer,
    textStyle: styles.blueText,
  },
  purple: {
    containerStyle: styles.purpleContainer,
    textStyle: styles.purpleText,
  },
  red: {
    containerStyle: styles.redContainer,
    textStyle: styles.redText,
  },
  green: {
    containerStyle: styles.greenContainer,
    textStyle: styles.greenText,
  },
  yellow: {
    containerStyle: styles.yellowContainer,
    textStyle: styles.yellowText,
  },
  orange: {
    containerStyle: styles.orangeContainer,
    textStyle: styles.orangeText,
  },
};

const sizeStyles = {
  sm: {
    containerStyle: styles.smContainer,
    textStyle: styles.smText,
  },
  md: {
    containerStyle: styles.mdContainer,
    textStyle: styles.mdText,
  },
  lg: {
    containerStyle: styles.lgContainer,
    textStyle: styles.lgText,
  },
};

export function Badge({ type, label, size = 'md', children }: BadgeProps) {
  const config = typeConfig[type];
  const sizeConfig = sizeStyles[size];
  
  return (
    <View style={[
      styles.baseContainer,
      config.containerStyle,
      sizeConfig.containerStyle
    ]}>
      <View style={styles.content}>
        {children}
        <Text style={[
          styles.baseText,
          config.textStyle,
          sizeConfig.textStyle
        ]}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  baseText: {
    fontWeight: '500',
  },
  // Size styles
  smContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  smText: {
    fontSize: 10,
  },
  mdContainer: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  mdText: {
    fontSize: 12,
  },
  lgContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  lgText: {
    fontSize: 14,
  },
  // Type-specific styles
  successContainer: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  successText: {
    color: '#166534',
  },
  warningContainer: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  warningText: {
    color: '#92400e',
  },
  dangerContainer: {
    backgroundColor: '#fecaca',
    borderColor: '#fca5a5',
  },
  dangerText: {
    color: '#991b1b',
  },
  infoContainer: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
  },
  infoText: {
    color: '#1e40af',
  },
  grayContainer: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  grayText: {
    color: '#374151',
  },
  blueContainer: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
  },
  blueText: {
    color: '#1e40af',
  },
  purpleContainer: {
    backgroundColor: '#e9d5ff',
    borderColor: '#d8b4fe',
  },
  purpleText: {
    color: '#7c3aed',
  },
  redContainer: {
    backgroundColor: '#fecaca',
    borderColor: '#fca5a5',
  },
  redText: {
    color: '#991b1b',
  },
  greenContainer: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  greenText: {
    color: '#166534',
  },
  yellowContainer: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  yellowText: {
    color: '#92400e',
  },
  orangeContainer: {
    backgroundColor: '#fed7aa',
    borderColor: '#fdba74',
  },
  orangeText: {
    color: '#9a3412',
  },
});