import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGanttChartData } from '../hooks/useGanttChartData';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { GanttChart } from '../components/GanttChart';
import { getToday, addDaysToDate } from '../../../utils/dateUtils';
import { DateNavigationModal } from '../components/DateNavigationModal';
import { Button } from '../../../components/ui/Button';

export function SchedulesOverviewPage() {
  const navigation = useNavigation();
  
  // Date control state
  const [currentStartDate, setCurrentStartDate] = useState(getToday());
  const [daysToShow, setDaysToShow] = useState(7);
  const [showDateNavigationModal, setShowDateNavigationModal] = useState(false);

  // Fetch Gantt chart data using the dedicated hook
  const { ganttVehicles, ganttItems, stats, loading, error, refreshGanttData } = useGanttChartData(
    currentStartDate,
    daysToShow
  );

  // Refresh data when component mounts
  useEffect(() => {
    refreshGanttData();
  }, [refreshGanttData]);

  // Date navigation functions
  const goToPreviousWeek = () => {
    setCurrentStartDate(addDaysToDate(currentStartDate, -7));
  };

  const goToNextWeek = () => {
    setCurrentStartDate(addDaysToDate(currentStartDate, 7));
  };

  const goToToday = () => {
    setCurrentStartDate(getToday());
  };

  // Handle manual date selection
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value);
    if (!isNaN(newDate.getTime())) {
      setCurrentStartDate(newDate);
    }
  };

  // Handle days to show selection
  const handleDaysToShowChange = (newDaysToShow: number) => {
    setDaysToShow(newDaysToShow);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedules Overview</Text>
          <Text style={styles.headerSubtitle}>
            Interactive timeline view of vehicle schedules and maintenance orders
          </Text>
        </View>
        
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Error loading schedules overview</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <TouchableOpacity
            onPress={refreshGanttData}
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedules Overview</Text>
        <Text style={styles.headerSubtitle}>
          Interactive timeline view of vehicle schedules and maintenance orders
        </Text>
      </View>

      {/* Enhanced Date Range Controls */}
      <View style={styles.dateControls}>
        <View style={styles.dateControlsLeft}>
          {loading && (
            <View style={styles.loadingIndicator}>
              <LoadingSpinner size="sm" />
              <Text style={styles.loadingText}>Loading data...</Text>
            </View>
          )}
        </View>
        <Button
          onPress={() => setShowDateNavigationModal(true)}
          variant="secondary"
        >
          <View style={styles.buttonContent}>
            <MaterialIcons name="settings" size={16} color="#6b7280" />
            <Text style={styles.dateNavigationText}>Date Navigation</Text>
          </View>
        </Button>
      </View>

      {/* Gantt Chart */}
      <View style={styles.ganttContainer}>
        <GanttChart
          vehicles={ganttVehicles}
          items={ganttItems}
          startDate={currentStartDate}
          daysToShow={daysToShow}
        />
      </View>

      {/* Summary Statistics */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#3b82f6' }]}>
              <MaterialIcons name="event" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Total Items</Text>
              <Text style={styles.statValue}>{stats.totalItems}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#10b981' }]}>
              <MaterialIcons name="trending-up" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Active Schedules</Text>
              <Text style={styles.statValue}>{stats.activeSchedules}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#f59e0b' }]}>
              <MaterialIcons name="build" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Active Maintenance</Text>
              <Text style={styles.statValue}>{stats.activeMaintenance}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#ef4444' }]}>
              <MaterialIcons name="warning" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Urgent Items</Text>
              <Text style={styles.statValue}>{stats.urgentItems}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendGrid}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.legendText}>Vehicle Schedules</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Scheduled/Active Maintenance</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFF59D', borderWidth: 1, borderColor: '#d1d5db' }]} />
            <Text style={styles.legendText}>Pending Authorization Maintenance</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#808080' }]} />
            <Text style={styles.legendText}>Completed Items</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Active Vehicle</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Maintenance Vehicle</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Idle Vehicle</Text>
          </View>
          <View style={styles.legendItem}>
            <MaterialIcons name="warning" size={16} color="#ef4444" />
            <Text style={styles.legendText}>Urgent</Text>
          </View>
        </View>
      </View>

      {/* Empty State */}
      {ganttItems.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <MaterialIcons name="event" size={48} color="#9ca3af" />
          <Text style={styles.emptyStateTitle}>No schedules or maintenance orders</Text>
          <Text style={styles.emptyStateText}>
            There are currently no items to display in the selected date range.
          </Text>
          <View style={styles.emptyStateActions}>
            <Button
              onPress={() => navigation.navigate('AddVehicleSchedule')}
              variant="primary"
              style={styles.emptyStateButton}
            >
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="truck" size={16} color="white" />
                <Text style={styles.emptyStateButtonText}>Create Schedule</Text>
              </View>
            </Button>
            <Button
              onPress={() => navigation.navigate('AddMaintenanceOrder')}
              variant="secondary"
              style={styles.emptyStateButton}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons name="build" size={16} color="#6b7280" />
                <Text style={styles.emptyStateSecondaryButtonText}>Create Maintenance Order</Text>
              </View>
            </Button>
          </View>
        </View>
      )}

      {/* Date Navigation Modal */}
      <DateNavigationModal
        isOpen={showDateNavigationModal}
        onClose={() => setShowDateNavigationModal(false)}
        currentStartDate={currentStartDate}
        daysToShow={daysToShow}
        onStartDateChange={handleStartDateChange}
        onDaysToShowChange={handleDaysToShowChange}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onGoToToday={goToToday}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateControlsLeft: {
    flex: 1,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateNavigationText: {
    color: '#6b7280',
    marginLeft: 8,
  },
  ganttContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
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
  legendContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 24,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateActions: {
    flexDirection: 'row',
    gap: 16,
  },
  emptyStateButton: {
    flex: 1,
  },
  emptyStateButtonText: {
    color: 'white',
    marginLeft: 8,
  },
  emptyStateSecondaryButtonText: {
    color: '#6b7280',
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