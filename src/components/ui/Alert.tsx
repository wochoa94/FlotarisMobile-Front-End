import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning' | 'conflict' | 'authorization' | 'network';
  message: string;
  onDismiss?: () => void;
  children?: React.ReactNode;
}

const alertConfig = {
  success: {
    containerStyle: styles.successContainer,
    textStyle: styles.successText,
    iconName: 'check-circle' as const,
    iconLibrary: 'MaterialIcons' as const,
    iconColor: '#10b981',
  },
  error: {
    containerStyle: styles.errorContainer,
    textStyle: styles.errorText,
    iconName: 'error' as const,
    iconLibrary: 'MaterialIcons' as const,
    iconColor: '#ef4444',
  },
  info: {
    containerStyle: styles.infoContainer,
    textStyle: styles.infoText,
    iconName: 'info' as const,
    iconLibrary: 'MaterialIcons' as const,
    iconColor: '#3b82f6',
  },
  warning: {
    containerStyle: styles.warningContainer,
    textStyle: styles.warningText,
    iconName: 'warning' as const,
    iconLibrary: 'MaterialIcons' as const,
    iconColor: '#f59e0b',
  },
  conflict: {
    containerStyle: styles.conflictContainer,
    textStyle: styles.conflictText,
    iconName: 'warning' as const,
    iconLibrary: 'MaterialIcons' as const,
    iconColor: '#ea580c',
  },
  authorization: {
    containerStyle: styles.authorizationContainer,
    textStyle: styles.authorizationText,
    iconName: 'warning' as const,
    iconLibrary: 'MaterialIcons' as const,
    iconColor: '#8b5cf6',
  },
  network: {
    containerStyle: styles.networkContainer,
    textStyle: styles.networkText,
    iconName: 'warning' as const,
    iconLibrary: 'MaterialIcons' as const,
    iconColor: '#3b82f6',
  },
};

export function Alert({ type, message, onDismiss, children }: AlertProps) {
  const config = alertConfig[type];

  const renderIcon = () => {
    if (config.iconLibrary === 'MaterialIcons') {
      return <MaterialIcons name={config.iconName} size={20} color={config.iconColor} />;
    } else {
      return <Ionicons name={config.iconName as any} size={20} color={config.iconColor} />;
    }
  };

  return (
    <View style={[styles.container, config.containerStyle]}>
      <View style={styles.content}>
        <View style={styles.iconAndMessage}>
          <View style={styles.iconContainer}>
            {renderIcon()}
          </View>
          <View style={styles.messageContainer}>
            <Text style={[styles.messageText, config.textStyle]}>{message}</Text>
            {children}
          </View>
        </View>
        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            style={styles.dismissButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={16} color={config.iconColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconAndMessage: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  messageContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 12,
  },
  // Type-specific styles
  successContainer: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  successText: {
    color: '#166534',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#991b1b',
  },
  infoContainer: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  infoText: {
    color: '#1e40af',
  },
  warningContainer: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  warningText: {
    color: '#92400e',
  },
  conflictContainer: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  conflictText: {
    color: '#9a3412',
  },
  authorizationContainer: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  authorizationText: {
    color: '#7c3aed',
  },
  networkContainer: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  networkText: {
    color: '#1e40af',
  },
});