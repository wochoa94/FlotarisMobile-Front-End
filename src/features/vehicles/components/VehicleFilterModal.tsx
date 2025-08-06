import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Modal } from '../../../components/ui/Modal';

interface VehicleFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  statusFilters: string[];
  unassignedFilter: boolean;
  onSearchTermChange: (term: string) => void;
  onToggleStatusFilter: (status: string) => void;
  onUnassignedFilterChange: (value: boolean) => void;
  onClearAllFilters: () => void;
}

export function VehicleFilterModal({
  isOpen,
  onClose,
  searchTerm,
  statusFilters,
  unassignedFilter,
  onSearchTermChange,
  onToggleStatusFilter,
  onUnassignedFilterChange,
  onClearAllFilters,
}: VehicleFilterModalProps) {
  if (!isOpen) return null;

  const handleClearAllFilters = () => {
    onClearAllFilters();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={
        <View style={styles.headerContent}>
          <MaterialIcons name="filter-list" size={20} color="#6b7280" />
          <Text style={styles.headerTitle}>Search & Filter Vehicles</Text>
        </View>
      }
      footerContent={
        <View style={styles.footerContent}>
          {(searchTerm || statusFilters.length > 0 || unassignedFilter) && (
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
          {/* Search */}
          <View style={styles.filterSection}>
            <Label>Search Vehicles</Label>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <MaterialIcons name="search" size={16} color="#9ca3af" />
              </View>
              <Input
                value={searchTerm}
                onChangeText={onSearchTermChange}
                placeholder="Search by name, VIN, make, or model..."
                style={styles.inputWithIcon}
              />
            </View>
          </View>
          
          {/* Status Filters */}
          <View style={styles.filterSection}>
            <Label>Status Filter</Label>
            <View style={styles.checkboxGroup}>
              {['active', 'maintenance', 'idle'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.checkboxItem}
                  onPress={() => onToggleStatusFilter(status)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    statusFilters.includes(status) && styles.checkboxChecked
                  ]}>
                    {statusFilters.includes(status) && (
                      <MaterialIcons name="check" size={16} color="white" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Additional Filters */}
          <View style={styles.filterSection}>
            <Label>Additional Filters</Label>
            <TouchableOpacity
              style={styles.checkboxItem}
              onPress={() => onUnassignedFilterChange(!unassignedFilter)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                unassignedFilter && styles.checkboxChecked
              ]}>
                {unassignedFilter && (
                  <MaterialIcons name="check" size={16} color="white" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Unassigned only</Text>
            </TouchableOpacity>
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
    gap: 24,
  },
  filterSection: {
    gap: 8,
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
  checkboxGroup: {
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 3,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
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