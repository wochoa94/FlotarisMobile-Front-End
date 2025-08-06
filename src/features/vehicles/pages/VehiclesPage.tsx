import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { useVehiclesData } from '../hooks/useVehiclesData';
import { VehicleTable } from '../components/VehicleTable';
import { VehicleFilterModal } from '../components/VehicleFilterModal';
import { Button } from '../../../components/ui/Button';

export function VehiclesPage() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const {
    // Data
    vehicles,
    totalCount,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    
    // State
    searchTerm,
    statusFilters,
    unassignedFilter,
    sortBy,
    sortOrder,
    itemsPerPage,
    loading,
    error,
    
    // Actions
    setSearchTerm,
    toggleStatusFilter,
    clearStatusFilters,
    setUnassignedFilter,
    setSorting,
    setCurrentPage,
    setItemsPerPage,
    clearAllFilters,
    refreshData,
  } = useVehiclesData();

  // Enhanced clear all filters function that also closes the modal
  const handleClearAllFilters = () => {
    clearAllFilters();
    setShowFilterModal(false);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vehicles</Text>
          <Text style={styles.headerSubtitle}>Manage your fleet vehicles</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Error loading vehicles</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <Button
            onPress={refreshData}
            variant="secondary"
          >
            <MaterialIcons name="refresh" size={16} color="#ef4444" />
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Vehicles</Text>
          <Text style={styles.headerSubtitle}>
            Manage your fleet vehicles
          </Text>
        </View>
        <View style={styles.headerActions}>
          {/* Filter Button */}
          <Button
            onPress={() => setShowFilterModal(true)}
            variant="secondary"
            style={styles.filterButton}
          >
            <View style={styles.filterButtonContent}>
              <MaterialIcons name="filter-list" size={16} color="#374151" />
              <Text style={styles.filterButtonText}>Filters</Text>
              {(searchTerm || statusFilters.length > 0 || unassignedFilter) && (
                <View style={styles.activeFilterBadge}>
                  <Text style={styles.activeFilterText}>Active</Text>
                </View>
              )}
            </View>
          </Button>
          
          {/* Add Vehicle Button */}
          {user?.isAdmin && (
            <Button
              onPress={() => navigation.navigate('AddVehicle')}
              variant="primary"
            >
              <View style={styles.addButtonContent}>
                <MaterialIcons name="add" size={16} color="white" />
                <Text style={styles.addButtonText}>Add Vehicle</Text>
              </View>
            </Button>
          )}
        </View>
      </View>

      {/* Filter Modal */}
      <VehicleFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        searchTerm={searchTerm}
        statusFilters={statusFilters}
        unassignedFilter={unassignedFilter}
        onSearchTermChange={setSearchTerm}
        onToggleStatusFilter={toggleStatusFilter}
        onUnassignedFilterChange={setUnassignedFilter}
        onClearAllFilters={handleClearAllFilters}
      />

      {/* Vehicle Table */}
      <VehicleTable
        vehicles={vehicles}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        itemsPerPage={itemsPerPage}
        loading={loading}
        user={user}
        searchTerm={searchTerm}
        statusFilters={statusFilters}
        unassignedFilter={unassignedFilter}
        onSorting={setSorting}
        onCurrentPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        onClearAllFilters={clearAllFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 60, // Account for status bar
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    flex: 1,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  activeFilterBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  activeFilterText: {
    fontSize: 10,
    color: '#1e40af',
    fontWeight: '500',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 16,
    margin: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#991b1b',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#991b1b',
  },
});