import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useVehiclesData } from '../features/vehicles/hooks/useVehiclesData';

// Placeholder Badge component for mobile
const Badge = ({ type, label }: { type: string; label: string }) => {
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'green':
        return { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' };
      case 'orange':
        return { backgroundColor: '#fed7aa', borderColor: '#fdba74' };
      case 'red':
        return { backgroundColor: '#fecaca', borderColor: '#fca5a5' };
      default:
        return { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' };
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'green':
        return '#166534';
      case 'orange':
        return '#9a3412';
      case 'red':
        return '#991b1b';
      default:
        return '#374151';
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(type)]}>
      <Text style={[styles.badgeText, { color: getTextColor(type) }]}>{label}</Text>
    </View>
  );
};

// Placeholder LoadingSpinner component
const LoadingSpinner = ({ size }: { size?: string }) => (
  <ActivityIndicator size={size === 'lg' ? 'large' : 'small'} color="#2563eb" />
);

export default function VehiclesScreen() {
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
      <View style={styles.centerContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error loading vehicles</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={refreshData}
          >
            <MaterialIcons name="refresh" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Vehicles</Text>
          <Text style={styles.subtitle}>Manage your fleet vehicles</Text>
        </View>
        <View style={styles.headerActions}>
          {/* Filter Button */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <MaterialIcons name="filter-list" size={16} color="#374151" />
            <Text style={styles.filterButtonText}>Filters</Text>
            {(searchTerm || statusFilters.length > 0 || unassignedFilter) && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterText}>Active</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* Add Vehicle Button */}
          {user?.isAdmin && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddVehicle')}
            >
              <MaterialIcons name="add" size={16} color="white" />
              <Text style={styles.addButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <MaterialIcons name="filter-list" size={20} color="#6b7280" />
              <Text style={styles.modalTitle}>Search & Filter Vehicles</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Search */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Search Vehicles</Text>
              <View style={styles.searchInputWrapper}>
                <MaterialIcons name="search" size={16} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search by name, VIN, make, or model..."
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
            
            {/* Status Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status Filter</Text>
              <View style={styles.checkboxGroup}>
                {['active', 'maintenance', 'idle'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={styles.checkboxItem}
                    onPress={() => toggleStatusFilter(status)}
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
              <Text style={styles.filterLabel}>Additional Filters</Text>
              <TouchableOpacity
                style={styles.checkboxItem}
                onPress={() => setUnassignedFilter(!unassignedFilter)}
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
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            {(searchTerm || statusFilters.length > 0 || unassignedFilter) && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={handleClearAllFilters}
              >
                <Ionicons name="close" size={16} color="#374151" />
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Results Summary */}
      <View style={styles.resultsHeader}>
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsTitle}>Fleet Vehicles ({totalCount})</Text>
          {loading && <LoadingSpinner size="sm" />}
        </View>
        
        {totalCount > 0 && (
          <Text style={styles.resultsCount}>
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
          </Text>
        )}
      </View>

      {/* Vehicles List */}
      <ScrollView 
        style={styles.vehiclesList}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshData} />
        }
      >
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={styles.vehicleCard}
              onPress={() => navigation.navigate('VehicleDetail', { id: vehicle.id })}
              activeOpacity={0.7}
            >
              <View style={styles.vehicleHeader}>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{vehicle.name}</Text>
                  <Text style={styles.vehicleDetails}>
                    {vehicle.make} {vehicle.model} {vehicle.year}
                  </Text>
                </View>
                <Badge 
                  type={vehicle.status === 'active' ? 'green' : vehicle.status === 'maintenance' ? 'orange' : 'red'} 
                  label={vehicle.status === 'active' ? 'Active' : vehicle.status === 'maintenance' ? 'Maintenance' : 'Idle'} 
                />
              </View>
              
              <View style={styles.vehicleMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>VIN</Text>
                  <Text style={styles.metricValue}>{vehicle.vin || 'N/A'}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Mileage</Text>
                  <Text style={styles.metricValue}>{vehicle.mileage?.toLocaleString() || 'N/A'} miles</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Maintenance Cost</Text>
                  <Text style={styles.metricValue}>${vehicle.maintenanceCost?.toLocaleString() || '0'}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Assigned Driver</Text>
                  <Text style={styles.metricValue}>
                    {vehicle.assignedDriverName || 'Unassigned'}
                  </Text>
                </View>
              </View>

              {user?.isAdmin && (
                <View style={styles.vehicleActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('VehicleDetail', { id: vehicle.id })}
                  >
                    <MaterialIcons name="visibility" size={16} color="#2563eb" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('EditVehicle', { id: vehicle.id })}
                  >
                    <MaterialIcons name="edit" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="truck" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>
              {loading ? 'Loading vehicles...' : 
               (searchTerm || statusFilters.length > 0 || unassignedFilter) ? 
               'No vehicles match your filters' : 'No vehicles found'}
            </Text>
            {!loading && (searchTerm || statusFilters.length > 0 || unassignedFilter) && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearAllFilters}
              >
                <Text style={styles.clearFiltersText}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.paginationButton, (!hasPreviousPage || loading) && styles.disabledButton]}
            onPress={() => setCurrentPage(currentPage - 1)}
            disabled={!hasPreviousPage || loading}
          >
            <MaterialIcons name="chevron-left" size={20} color={(!hasPreviousPage || loading) ? "#9ca3af" : "#374151"} />
            <Text style={[styles.paginationButtonText, (!hasPreviousPage || loading) && styles.disabledText]}>
              Previous
            </Text>
          </TouchableOpacity>
          
          <View style={styles.pageInfo}>
            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.paginationButton, (!hasNextPage || loading) && styles.disabledButton]}
            onPress={() => setCurrentPage(currentPage + 1)}
            disabled={!hasNextPage || loading}
          >
            <Text style={[styles.paginationButtonText, (!hasNextPage || loading) && styles.disabledText]}>
              Next
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={(!hasNextPage || loading) ? "#9ca3af" : "#374151"} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    maxWidth: 300,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  retryButton: {
    padding: 8,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: 'white',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  searchInputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 40,
    paddingRight: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: 'white',
    fontSize: 14,
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
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  applyFiltersButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyFiltersText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginRight: 16,
  },
  resultsCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  vehiclesList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  vehicleCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  vehicleMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metricItem: {
    minWidth: '45%',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  vehicleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginVertical: 16,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#9ca3af',
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageText: {
    fontSize: 14,
    color: '#6b7280',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});