import React from 'react';
import { View, Text, TouchableOpacity, Modal as RNModal, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string; // Keep for compatibility but won't be used
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  headerContent,
  footerContent,
  maxWidth = '2xl',
}: ModalProps) {
  return (
    <RNModal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              {headerContent ? (
                headerContent
              ) : (
                <Text style={styles.title}>{title}</Text>
              )}
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={styles.body}>
              {children}
            </View>

            {/* Footer */}
            {footerContent && (
              <View style={styles.footer}>
                {footerContent}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(75, 85, 99, 0.5)', // bg-gray-600 bg-opacity-50
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '100%',
    maxWidth: 500, // Responsive max width for mobile
    maxHeight: '90%',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 16,
  },
  body: {
    padding: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
});