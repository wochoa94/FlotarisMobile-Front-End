import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { useDriversData } from '../hooks/useDriversData';
import { driverService } from '../../../services/apiService';
import { DriverTable } from '../components/DriverTable';
import { DriverFilterModal } from '../components/DriverFilterModal';
import { DeleteDriverConfirmationModal } from '../components/DeleteDriverConfirmationModal';
import { Button } from '../../../components/ui/Button';
import { Driver } from '../../../types';

export function DriversPage() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const {
    // Data
    drivers,
    totalCount,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    
    // State
    searchTerm,
    emailSearchTerm,
    sortBy,
    sortOrder,
    itemsPerPage,
    loading,
    error,
    
    // Actions
    setSearchTerm,
    setEmailSearchTerm,
    setSorting,
    setCurrentPage,
    setItemsPerPage,
    clearAllFilters,
    refreshData,
  } = useDriversData();

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; driver: Driver | null }>({
    isOpen: false,
    driver: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete driver
  const handleDeleteDriver = async (driver: Driver) => {
    setDeleteModal({ isOpen: true, driver });
  };

  const confirmDeleteDriver = async () => {
    if (!deleteModal.driver) return;

    setIsDeleting(true);
    try {
      await driverService.deleteDriver(deleteModal.driver.id);
      await refreshData();
      setDeleteModal({ isOpen: false, driver: null });
    } catch (error) {
      console.error('Error deleting driver:', error);
      // You could add error handling here
    } finally {
      setIsDeleting(false);
    }
  };

  // Enhanced clear all filters function that also closes the modal
  const handleClearAllFilters = () => {
    clearAllFilters();
    setShowFilterModal(false);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Drivers</Text>
          <Text style={styles.headerSubtitle}>Manage your fleet drivers</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Error loading drivers</Text>
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
          <Text style={styles.headerTitle}>Drivers</Text>
          <Text style={styles.headerSubtitle}>Manage your fleet drivers</Text>
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
              {(searchTerm || emailSearchTerm) && (
                <View style={styles.activeFilterBadge}>
                  <Text style={styles.activeFilterText}>Active</Text>
                </View>
              )}
            </View>
          </Button>
          
          {/* Add Driver Button */}
          {user?.isAdmin && (
            <Button
              onPress={() => navigation.navigate('AddDriver')}
              variant="primary"
            >
              <View style={styles.addButtonContent}>
                <MaterialIcons name="add" size={16} color="white" />
                <Text style={styles.addButtonText}>Add Driver</Text>
              </View>
            </Button>
          )}
        </View>
      </View>

      {/* Filter Modal */}
      <DriverFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        searchTerm={searchTerm}
        emailSearchTerm={emailSearchTerm}
        onSearchTermChange={setSearchTerm}
        onEmailSearchTermChange={setEmailSearchTerm}
        onClearAllFilters={handleClearAllFilters}
      />

      {/* Driver Table */}
      <DriverTable
        drivers={drivers}
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
        emailSearchTerm={emailSearchTerm}
        onSorting={setSorting}
        onCurrentPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        onClearAllFilters={clearAllFilters}
        onDeleteDriver={handleDeleteDriver}
      />

      {/* Delete Confirmation Modal */}
      <DeleteDriverConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, driver: null })}
        driver={deleteModal.driver}
        isDeleting={isDeleting}
        onConfirmDelete={confirmDeleteDriver}
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