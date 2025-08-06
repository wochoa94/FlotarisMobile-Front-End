import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Driver } from '../../../types';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

interface DeleteDriverConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
  isDeleting: boolean;
  onConfirmDelete: () => Promise<void>;
}

export function DeleteDriverConfirmationModal({
  isOpen,
  onClose,
  driver,
  isDeleting,
  onConfirmDelete,
}: DeleteDriverConfirmationModalProps) {
  if (!isOpen || !driver) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={
        <View style={styles.headerContent}>
          <MaterialIcons name="warning" size={24} color="#ef4444" />
          <Text style={styles.headerTitle}>Delete Driver</Text>
        </View>
      }
      footerContent={
        <View style={styles.footerContent}>
          <Button
            onPress={onClose}
            disabled={isDeleting}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            onPress={onConfirmDelete}
            disabled={isDeleting}
            variant="danger"
          >
            {isDeleting ? (
              <View style={styles.loadingContent}>
                <LoadingSpinner size="sm" color="white" />
                <Text style={styles.loadingText}>Deleting...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <MaterialIcons name="delete" size={16} color="white" />
                <Text style={styles.buttonText}>Confirm Delete</Text>
              </View>
            )}
          </Button>
        </View>
      }
    >
      <View style={styles.content}>
        <Text style={styles.warningText}>
          <Text style={styles.boldText}>Warning:</Text> This action cannot be undone. Are you sure you want to permanently delete this driver?
        </Text>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverEmail}>{driver.email}</Text>
          <Text style={styles.driverId}>ID: {driver.idNumber}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
  },
  content: {
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  boldText: {
    fontWeight: 'bold',
  },
  driverInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 12,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  driverEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  driverId: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginLeft: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
  },
});