import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Driver, User as UserType } from '../../../types';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';

interface DriverTableProps {
  drivers: Driver[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
  itemsPerPage: number;
  loading: boolean;
  user: UserType | null;
  searchTerm: string;
  emailSearchTerm: string;
  onSorting: (column: 'name' | 'email' | 'idNumber' | 'createdAt') => void;
  onCurrentPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onClearAllFilters: () => void;
  onDeleteDriver: (driver: Driver) => void;
}

export function DriverTable({
  drivers,
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
  emailSearchTerm,
  onSorting,
  onCurrentPageChange,
  onItemsPerPageChange,
  onClearAllFilters,
  onDeleteDriver,
}: DriverTableProps) {
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
          <Text style={styles.headerTitle}>Drivers ({totalCount})</Text>
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

      {/* Drivers List */}
      <ScrollView style={styles.driversList}>
        {drivers.length > 0 ? (
          drivers.map((driver) => (
            <TouchableOpacity
              key={driver.id}
              style={styles.driverCard}
              onPress={() => navigation.navigate('DriverDetail', { id: driver.id })}
              activeOpacity={0.7}
            >
              <View style={styles.driverHeader}>
                <View style={styles.driverInfo}>
                  <View style={styles.avatarContainer}>
                    <MaterialCommunityIcons name="account" size={20} color="#8b5cf6" />
                  </View>
                  <View style={styles.driverDetails}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <Text style={styles.driverEmail}>{driver.email}</Text>
                  </View>
                </View>
                
                {user?.isAdmin && (
                  <View style={styles.driverActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => navigation.navigate('DriverDetail', { id: driver.id })}
                    >
                      <MaterialIcons name="visibility" size={16} color="#2563eb" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => navigation.navigate('EditDriver', { id: driver.id })}
                    >
                      <MaterialIcons name="edit" size={16} color="#6b7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onDeleteDriver(driver)}
                    >
                      <MaterialIcons name="delete" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              
              <View style={styles.driverMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>ID Number</Text>
                  <Text style={styles.metricValue}>{driver.idNumber}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Assigned Vehicle</Text>
                  <Text style={styles.metricValue}>
                    {driver.assignedVehicle ? driver.assignedVehicle.name : 'Unassigned'}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Created</Text>
                  <Text style={styles.metricValue}>
                    {new Date(driver.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>
              {loading ? 'Loading drivers...' : 
               (searchTerm || emailSearchTerm) ? 
               'No drivers match your search' : 'No drivers found'}
            </Text>
            {!loading && (searchTerm || emailSearchTerm) && (
              <Button
                onPress={onClearAllFilters}
                variant="secondary"
              >
                Clear search filters
              </Button>
            )}
            {!loading && !searchTerm && !emailSearchTerm && user?.isAdmin && (
              <Button
                onPress={() => navigation.navigate('AddDriver')}
                variant="primary"
              >
                <View style={styles.buttonContent}>
                  <MaterialIcons name="add" size={16} color="white" />
                  <Text style={styles.addButtonText}>Add First Driver</Text>
                </View>
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
  driversList: {
    flex: 1,
    padding: 16,
  },
  driverCard: {
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
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f3e8ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  driverEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
  },
  driverMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    minWidth: '30%',
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    marginLeft: 8,
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