import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Vehicle, User } from '../../../types';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';

interface VehicleTableProps {
  vehicles: Vehicle[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  itemsPerPage: number;
  loading: boolean;
  user: User | null;
  searchTerm: string;
  statusFilters: string[];
  unassignedFilter: boolean;
  onSorting: (column: 'name' | 'status' | 'mileage' | 'maintenanceCost' | 'assignedDriver') => void;
  onCurrentPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onClearAllFilters: () => void;
}

export function VehicleTable({
  vehicles,
  totalCount,
  totalPages,
  currentPage,
  hasNextPage,
  hasPreviousPage,
  sortBy,
  sortOrder,
  itemsPerPage,
  loading,
  user,
  searchTerm,
  statusFilters,
  unassignedFilter,
  onSorting,
  onCurrentPageChange,
  onItemsPerPageChange,
  onClearAllFilters,
}: VehicleTableProps) {
  const navigation = useNavigation();

  // Render sort icon
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <MaterialIcons name="keyboard-arrow-up" size={16} color="#d1d5db" />;
    }
    return sortOrder === 'asc' 
      ? <MaterialIcons name="keyboard-arrow-up" size={16} color="#2563eb" />
      : <MaterialIcons name="keyboard-arrow-down" size={16} color="#2563eb" />;
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onCurrentPageChange(page);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <Card style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Fleet Vehicles ({totalCount})</Text>
          {loading && <LoadingSpinner size="sm" />}
        </View>
        
        <View style={styles.headerRight}>
          {/* Items per page */}
          <View style={styles.itemsPerPageContainer}>
            <Text style={styles.itemsPerPageLabel}>Show:</Text>
            <Input
              as="select"
              selectedValue={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(Number(value))}
              style={styles.itemsPerPageSelect}
            >
              <Input.Item label="5" value="5" />
              <Input.Item label="10" value="10" />
              <Input.Item label="25" value="25" />
              <Input.Item label="50" value="50" />
            </Input>
          </View>
          
          {totalCount > 0 && (
            <Text style={styles.resultsCount}>
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
            </Text>
          )}
        </View>
      </View>

      {/* Vehicles List */}
      <ScrollView style={styles.vehiclesList}>
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
              <Button
                onPress={onClearAllFilters}
                variant="secondary"
              >
                Clear all filters
              </Button>
            )}
          </View>
        )}
      </ScrollView>

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.paginationButton, (!hasPreviousPage || loading) && styles.disabledButton]}
            onPress={() => handlePageChange(currentPage - 1)}
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
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage || loading}
          >
            <Text style={[styles.paginationButtonText, (!hasNextPage || loading) && styles.disabledText]}>
              Next
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={(!hasNextPage || loading) ? "#9ca3af" : "#374151"} />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemsPerPageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemsPerPageLabel: {
    fontSize: 14,
    color: '#374151',
  },
  itemsPerPageSelect: {
    minWidth: 60,
  },
  resultsCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  vehiclesList: {
    flex: 1,
    padding: 16,
  },
  vehicleCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    padding: 16,
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
});