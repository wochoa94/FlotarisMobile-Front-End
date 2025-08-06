import React from 'react';
import { View, StyleSheet } from 'react-native';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <View style={styles.container}>
      {/* Navigation component is typically handled by React Navigation at a higher level */}
      <View style={styles.mainContent}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes up full height
    backgroundColor: '#f9fafb', // Equivalent to bg-gray-50 from default theme
  },
  mainContent: {
    flex: 1, // Takes remaining space
    paddingHorizontal: 16, // Equivalent to px-4, sm:px-6, lg:px-8
    paddingVertical: 24, // Equivalent to py-6
    // lg:ml-0 and lg:ml-20 are web-specific for sidebar, removed for mobile
  },
});
