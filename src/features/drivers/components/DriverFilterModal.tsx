import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Modal } from '../../../components/ui/Modal';

interface DriverFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  emailSearchTerm: string;
  onSearchTermChange: (term: string) => void;
  onEmailSearchTermChange: (term: string) => void;
  onClearAllFilters: () => void;
}

export function DriverFilterModal({
  isOpen,
  onClose,
  searchTerm,
  emailSearchTerm,
  onSearchTermChange,
  onEmailSearchTermChange,
  onClearAllFilters,
}: DriverFilterModalProps) {
  if (!isOpen) return null;

  const handleClearAllFilters = () => {
    onClearAllFilters();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Search & Filter Drivers"
      headerContent={
        <View style={styles.headerContent}>
          <MaterialIcons name="filter-list" size={20} color="#6b7280" />
          <Text style={styles.headerTitle}>Search & Filter Drivers</Text>
        </View>
      }
      footerContent={
        <View style={styles.footerContent}>
          {(searchTerm || emailSearchTerm) && (
            <Button
              onPress={handleClearAllFilters}
              variant="secondary"
            >
              <View style={styles.buttonContent}>
                <MaterialIcons name="clear" size={16} color="#374151" />
                <Text style={styles.clearButtonText}>Clear All Filters</Text>
              </View>
            </Button>
          )}
          <Button
            onPress={onClose}
            variant="primary"
          >
            Apply Filters
          </Button>
        </View>
      }
    >
      <View style={styles.content}>
        <View style={styles.filterGrid}>
          {/* Name Search */}
          <View style={styles.filterSection}>
            <Label>Search by Name</Label>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <MaterialIcons name="search" size={16} color="#9ca3af" />
              </View>
              <Input
                value={searchTerm}
                onChangeText={onSearchTermChange}
                placeholder="Search by driver name..."
                style={styles.inputWithIcon}
              />
            </View>
          </View>
          
          {/* Email Search */}
          <View style={styles.filterSection}>
            <Label>Search by Email</Label>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <MaterialIcons name="search" size={16} color="#9ca3af" />
              </View>
              <Input
                value={emailSearchTerm}
                onChangeText={onEmailSearchTermChange}
                placeholder="Search by email address..."
                style={styles.inputWithIcon}
              />
            </View>
          </View>
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
    marginLeft: 8,
  },
  content: {
    marginBottom: 16,
  },
  filterGrid: {
    gap: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 40,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#374151',
    marginLeft: 8,
  },
});