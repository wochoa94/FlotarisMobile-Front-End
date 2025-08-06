import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { useVehicleSchedulesData } from '../hooks/useVehicleSchedulesData';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { vehicleScheduleService } from '../../../services/apiService';
import { VehicleSchedule } from '../../../types';
import { getDaysBetweenDates, parseDate, parseDateEnd, formatTooltipDate } from '../../../utils/dateUtils';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';

export function VehicleSchedulesPage() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const {
    // Data
    vehicleSchedules,
    totalCount,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    
    // State
    searchTerm,
    statusFilters,
    sortBy,
    sortOrder,
    itemsPerPage,
    loading,
    error,
    
    // Actions
    setSearchTerm,
    toggleStatusFilter,
    clearStatusFilters,
    setSorting,
    setCurrentPage,
    setItemsPerPage,
    clearAllFilters,
    refreshData,
    vehicleScheduleSummary,
  } = useVehicleSchedulesData();

  // Modal state for notes
  const [showNotesModal, setShowNotesModal] = useState<string | null>(null);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{ 
    isOpen: boolean; 
    schedule: VehicleSchedule | null; 
    isActiveSchedule: boolean;
  }>({
    isOpen: false,
    schedule: null,
    isActiveSchedule: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Enhanced clear all filters function that also closes the modal
  const handleClearAllFilters = () => {
    clearAllFilters();
    setShowFilterModal(false);
  };

  // Get vehicle name by ID (from backend response)
  const getVehicleName = (vehicleId: string): string => {
    const schedule = vehicleSchedules.find(s => s.vehicleId === vehicleId);
    return (schedule as any)?.vehicle?.name || `Vehicle ${vehicleId.slice(0, 8)}...`;
  };

  // Get vehicle details by ID (from backend response)
  const getVehicleDetails = (vehicleId: string) => {
    const schedule = vehicleSchedules.find(s => s.vehicleId === vehicleId);
    const vehicle = (schedule as any)?.vehicle;
    return vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year}` : 'Unknown';
  };

  // Get driver name by ID (from backend response)
  const getDriverName = (driverId: string): string => {
    const schedule = vehicleSchedules.find(s => s.driverId === driverId);
    return (schedule as any)?.driver?.name || `Driver ${driverId.slice(0, 8)}...`;
  };

  // Calculate schedule duration using the utility function for accurate inclusive day count
  const getScheduleDuration = (startDate: string, endDate: string): string => {
    const startDateObj = parseDate(startDate);
    const endDateObj = parseDateEnd(endDate);
    const diffDays = getDaysBetweenDates(startDateObj, endDateObj);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  // Handler for create schedule button
  const handleCreateSchedule = () => {
    navigation.navigate('AddVehicleSchedule');
  };

  const handleEditSchedule = (scheduleId: string) => {
    console.log('Edit schedule clicked for:', scheduleId);
    // TODO: Implement edit schedule functionality
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const schedule = vehicleSchedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    
    // Check if the schedule is active to show conditional warning
    const isActiveSchedule = schedule.status === 'active';
    
    setDeleteModal({
      isOpen: true,
      schedule,
      isActiveSchedule,
    });
  };

  // Handle delete confirmation
  const confirmDeleteSchedule = async () => {
    if (!deleteModal.schedule) return;

    setIsDeleting(true);
    try {
      await vehicleScheduleService.deleteVehicleSchedule(deleteModal.schedule.id);
      await refreshData();
      setDeleteModal({ isOpen: false, schedule: null, isActiveSchedule: false });
    } catch (error) {
      console.error('Error deleting vehicle schedule:', error);
      // You could add error handling here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewNotes = (scheduleId: string) => {
    setShowNotesModal(scheduleId);
  };

  const selectedSchedule = showNotesModal ? vehicleSchedules.find(s => s.id === showNotesModal) : null;

  // Use backend summary data instead of calculating from paginated results
  const scheduledCount = vehicleScheduleSummary?.scheduled || 0;
  const activeCount = vehicleScheduleSummary?.active || 0;

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vehicle Schedules</Text>
          <Text style={styles.headerSubtitle}>Manage vehicle assignments and schedules</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Error loading vehicle schedules</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <TouchableOpacity
            onPress={refreshData}
            style={styles.retryButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="refresh" size={20} color="#ef4444" />
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
          <Text style={styles.headerTitle}>Vehicle Schedules</Text>
          <Text style={styles.headerSubtitle}>
            Manage vehicle assignments and schedules
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
              {(searchTerm || statusFilters.length > 0) && (
                <View style={styles.activeFilterBadge}>
                  <Text style={styles.activeFilterText}>Active</Text>
                </View>
              )}
            </View>
          </Button>
          
          {/* Create Schedule Button */}
          {user?.isAdmin && (
            <Button
              onPress={handleCreateSchedule}
              variant="primary"
            >
              <View style={styles.addButtonContent}>
                <MaterialIcons name="add" size={16} color="white" />
                <Text style={styles.addButtonText}>Create Schedule</Text>
              </View>
            </Button>
          )}
        </View>
      </View>

      {/* Filter Modal */}
      {showFilterModal && (
        <Modal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          headerContent={
            <View style={styles.modalHeaderContent}>
              <MaterialIcons name="filter-list" size={20} color="#6b7280" />
              <Text style={styles.modalHeaderTitle}>Search & Filter Vehicle Schedules</Text>
            </View>
          }
          footerContent={
            <View style={styles.modalFooterContent}>
              {(searchTerm || statusFilters.length > 0) && (
                <Button
                  onPress={handleClearAllFilters}
                  variant="secondary"
                  style={styles.modalFooterButton}
                >
                  <View style={styles.buttonContent}>
                    <MaterialIcons name="clear" size={16} color="#374151" />
                    <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                  </View>
                </Button>
              )}
              <Button
                onPress={() => setShowFilterModal(false)}
                variant="primary"
                style={styles.modalFooterButton}
              >
                Apply Filters
              </Button>
            </View>
          }
        >
          <View style={styles.filterContent}>
            {/* Search */}
            <View style={styles.filterSection}>
              <Label>Search Schedules</Label>
              <View style={styles.searchInputWrapper}>
                <View style={styles.searchIcon}>
                  <MaterialIcons name="search" size={16} color="#9ca3af" />
                </View>
                <Input
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search by vehicle, driver, or notes..."
                  style={styles.searchInput}
                />
              </View>
            </View>
            
            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Label>Status Filter</Label>
              <View style={styles.checkboxGroup}>
                {[
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' }
                ].map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={styles.checkboxItem}
                    onPress={() => toggleStatusFilter(status.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.checkbox,
                      statusFilters.includes(status.value) && styles.checkboxChecked
                    ]}>
                      {statusFilters.includes(status.value) && (
                        <MaterialIcons name="check" size={16} color="white" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{status.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Summary Stats */}
      <View style={styles.summaryStats}>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#10b981' }]}>
              <MaterialCommunityIcons name="truck" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Active Schedules</Text>
              <Text style={styles.statValue}>{activeCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#3b82f6' }]}>
              <MaterialIcons name="event" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Scheduled</Text>
              <Text style={styles.statValue}>{scheduledCount}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Results Summary */}
      <View style={styles.resultsHeader}>
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsTitle}>Vehicle Schedules ({totalCount})</Text>
          {loading && <LoadingSpinner size="sm" />}
        </View>
        
        {totalCount > 0 && (
          <Text style={styles.resultsCount}>
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
          </Text>
        )}
      </View>

      {/* Schedules List */}
      <ScrollView 
        style={styles.schedulesList}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshData} />
        }
      >
        {vehicleSchedules.length > 0 ? (
          vehicleSchedules.map((schedule) => (
            <View key={schedule.id} style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.vehicleName}>{getVehicleName(schedule.vehicleId)}</Text>
                  <Text style={styles.vehicleDetails}>{getVehicleDetails(schedule.vehicleId)}</Text>
                </View>
                <Badge 
                  type={schedule.status === 'active' ? 'green' : schedule.status === 'scheduled' ? 'blue' : 'gray'} 
                  label={schedule.status === 'active' ? 'Active' : schedule.status === 'scheduled' ? 'Scheduled' : 'Completed'} 
                />
              </View>
              
              <View style={styles.scheduleDetails}>
                <View style={styles.driverInfo}>
                  <View style={styles.driverAvatar}>
                    <MaterialCommunityIcons name="account" size={16} color="#8b5cf6" />
                  </View>
                  <Text style={styles.driverName}>{getDriverName(schedule.driverId)}</Text>
                </View>
                
                <View style={styles.scheduleMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Start Date</Text>
                    <Text style={styles.metricValue}>{formatTooltipDate(schedule.startDate)}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>End Date</Text>
                    <Text style={styles.metricValue}>{formatTooltipDate(schedule.endDate)}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Duration</Text>
                    <Text style={styles.metricValue}>{getScheduleDuration(schedule.startDate, schedule.endDate)}</Text>
                  </View>
                </View>
              </View>

              {user?.isAdmin && (
                <View style={styles.scheduleActions}>
                  {schedule.notes && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleViewNotes(schedule.id)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="description" size={16} color="#2563eb" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditSchedule(schedule.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="edit" size={16} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteSchedule(schedule.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="delete" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="event" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>
              {loading ? 'Loading vehicle schedules...' : 
               (searchTerm || statusFilters.length !== 2 || !statusFilters.includes('active') || !statusFilters.includes('scheduled')) ? 
               'No schedules match your filters' : 'No vehicle schedules found'}
            </Text>
            {!loading && (searchTerm || statusFilters.length !== 2 || !statusFilters.includes('active') || !statusFilters.includes('scheduled')) && (
              <Button
                onPress={handleClearAllFilters}
                variant="secondary"
              >
                Clear filters
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
            onPress={() => setCurrentPage(currentPage - 1)}
            disabled={!hasPreviousPage || loading}
            activeOpacity={0.7}
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
            activeOpacity={0.7}
          >
            <Text style={[styles.paginationButtonText, (!hasNextPage || loading) && styles.disabledText]}>
              Next
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={(!hasNextPage || loading) ? "#9ca3af" : "#374151"} />
          </TouchableOpacity>
        </View>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedSchedule && (
        <Modal
          isOpen={!!showNotesModal}
          onClose={() => setShowNotesModal(null)}
          headerContent={
            <View style={styles.notesModalHeader}>
              <MaterialIcons name="description" size={20} color="#2563eb" />
              <View style={styles.notesModalHeaderText}>
                <Text style={styles.notesModalTitle}>Schedule Notes</Text>
                <Text style={styles.notesModalSubtitle}>
                  {getVehicleName(selectedSchedule.vehicleId)} - {getDriverName(selectedSchedule.driverId)}
                </Text>
              </View>
            </View>
          }
        >
          <View style={styles.notesModalContent}>
            <View style={styles.notesContent}>
              <Text style={styles.notesText}>
                {selectedSchedule.notes || 'No notes available for this schedule.'}
              </Text>
            </View>

            <View style={styles.notesStatusInfo}>
              <View style={styles.notesStatusItem}>
                <Text style={styles.notesStatusLabel}>Status:</Text>
                <Badge 
                  type={selectedSchedule.status === 'active' ? 'green' : selectedSchedule.status === 'scheduled' ? 'blue' : 'gray'} 
                  label={selectedSchedule.status === 'active' ? 'Active' : selectedSchedule.status === 'scheduled' ? 'Scheduled' : 'Completed'} 
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.schedule && (
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, schedule: null, isActiveSchedule: false })}
          headerContent={
            <View style={styles.deleteModalHeader}>
              <MaterialIcons name="warning" size={20} color="#ef4444" />
              <Text style={styles.deleteModalTitle}>Delete Vehicle Schedule</Text>
            </View>
          }
          footerContent={
            <View style={styles.deleteModalFooter}>
              <Button
                onPress={() => setDeleteModal({ isOpen: false, schedule: null, isActiveSchedule: false })}
                disabled={isDeleting}
                variant="secondary"
                style={styles.modalFooterButton}
              >
                Cancel
              </Button>
              <Button
                onPress={confirmDeleteSchedule}
                disabled={isDeleting}
                variant="danger"
                style={styles.modalFooterButton}
              >
                {isDeleting ? (
                  <View style={styles.buttonContent}>
                    <LoadingSpinner size="sm" color="white" />
                    <Text style={styles.deletingText}>Deleting...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <MaterialIcons name="delete" size={16} color="white" />
                    <Text style={styles.deleteButtonText}>
                      {deleteModal.isActiveSchedule ? 'Delete Active Schedule' : 'Confirm Delete'}
                    </Text>
                  </View>
                )}
              </Button>
            </View>
          }
        >
          <View style={styles.deleteModalContent}>
            {deleteModal.isActiveSchedule ? (
              <View style={styles.activeScheduleWarning}>
                <View style={styles.warningHeader}>
                  <MaterialIcons name="warning" size={20} color="#ef4444" />
                  <Text style={styles.warningTitle}>
                    <Text style={styles.warningBold}>Warning:</Text> You are about to delete an active schedule. This action cannot be undone.
                  </Text>
                </View>
                <Text style={styles.warningSubtext}>
                  Are you sure you want to proceed?
                </Text>
              </View>
            ) : (
              <Text style={styles.deleteWarningText}>
                <Text style={styles.deleteWarningBold}>Warning:</Text> This action cannot be undone. Are you sure you want to permanently delete this schedule?
              </Text>
            )}
            
            <View style={styles.schedulePreview}>
              <Text style={styles.schedulePreviewTitle}>
                {getVehicleName(deleteModal.schedule.vehicleId)} - {getDriverName(deleteModal.schedule.driverId)}
              </Text>
              <Text style={styles.schedulePreviewDates}>
                {formatTooltipDate(deleteModal.schedule.startDate)} - {formatTooltipDate(deleteModal.schedule.endDate)}
              </Text>
              <View style={styles.schedulePreviewStatus}>
                <Badge 
                  type={deleteModal.schedule.status === 'active' ? 'green' : deleteModal.schedule.status === 'scheduled' ? 'blue' : 'gray'} 
                  label={deleteModal.schedule.status === 'active' ? 'Active' : deleteModal.schedule.status === 'scheduled' ? 'Scheduled' : 'Completed'} 
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  modalFooterContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalFooterButton: {
    flex: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFiltersText: {
    color: '#374151',
    marginLeft: 8,
  },
  filterContent: {
    gap: 24,
  },
  filterSection: {
    gap: 8,
  },
  searchInputWrapper: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
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
  summaryStats: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
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
  schedulesList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scheduleCard: {
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
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scheduleInfo: {
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
  scheduleDetails: {
    gap: 12,
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#f3e8ff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  scheduleMetrics: {
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
  scheduleActions: {
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
  notesModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesModalHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  notesModalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  notesModalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  notesModalContent: {
    gap: 16,
  },
  notesContent: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  notesStatusInfo: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    padding: 12,
  },
  notesStatusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notesStatusLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
  },
  deleteModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  deleteModalContent: {
    gap: 16,
  },
  activeScheduleWarning: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 6,
    padding: 12,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 14,
    color: '#991b1b',
    marginLeft: 12,
    flex: 1,
  },
  warningBold: {
    fontWeight: 'bold',
  },
  warningSubtext: {
    fontSize: 14,
    color: '#991b1b',
    marginLeft: 32,
  },
  deleteWarningText: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteWarningBold: {
    fontWeight: 'bold',
  },
  schedulePreview: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 12,
  },
  schedulePreviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  schedulePreviewDates: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  schedulePreviewStatus: {
    marginTop: 8,
  },
  deletingText: {
    color: 'white',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: 'white',
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
  retryButton: {
    padding: 8,
  },
});