import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useFleetData } from '../hooks/useFleetData';
import { formatDate } from '../utils/dateUtils';

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
const LoadingSpinner = ({ size, text }: { size?: string; text?: string }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size={size === 'lg' ? 'large' : 'small'} color="#2563eb" />
    {text && <Text style={styles.loadingText}>{text}</Text>}
  </View>
);

export default function DashboardScreen() {
  const { data, loading, error, refreshData } = useFleetData();
  const navigation = useNavigation();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => refreshData()}
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { vehicles, summary } = data;

  // Use aggregated data from backend if available, otherwise fallback to client-side calculation
  const totalVehicles = summary?.totalVehicles ?? vehicles.length;
  const totalDrivers = summary?.totalDrivers ?? data.drivers.length;
  const activeVehicles = summary?.activeVehiclesCount ?? vehicles.filter(v => v.status === 'active').length;
  const totalMaintenanceCost = summary?.totalMaintenanceCost ?? vehicles.reduce((sum, v) => sum + (v.maintenanceCost || 0), 0);
  
  // Vehicle status counts for donut chart
  const vehicleStatusCounts = summary?.vehicleStatusCounts ?? {
    active: vehicles.filter(v => v.status === 'active').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    idle: vehicles.filter(v => v.status === 'idle').length,
  };

  const stats = [
    {
      name: 'Total Vehicles',
      value: totalVehicles,
      icon: 'truck',
      color: '#3b82f6',
      onPress: () => navigation.navigate('Vehicles'),
    },
    {
      name: 'Total Drivers',
      value: totalDrivers,
      icon: 'account-group',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('Drivers'),
    },
    {
      name: 'Active Vehicles', 
      value: activeVehicles,
      icon: 'trending-up',
      color: '#10b981',
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshData} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fleet Dashboard</Text>
        <Text style={styles.subtitle}>Welcome to your fleet management overview</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <TouchableOpacity
            key={stat.name}
            style={styles.statCard}
            onPress={stat.onPress}
            activeOpacity={stat.onPress ? 0.7 : 1}
          >
            <View style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  <MaterialCommunityIcons name={stat.icon as any} size={24} color="white" />
                </View>
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statName}>{stat.name}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cost Overview Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cost Overview</Text>
        <View style={styles.costGrid}>
          {/* Total Maintenance Cost */}
          <View style={styles.costCard}>
            <View style={styles.costIconContainer}>
              <View style={[styles.costIcon, { backgroundColor: '#f59e0b' }]}>
                <MaterialIcons name="attach-money" size={24} color="white" />
              </View>
            </View>
            <Text style={styles.costTitle}>Total Maintenance Cost</Text>
            <Text style={styles.costValue}>${totalMaintenanceCost.toLocaleString()}</Text>
            <Text style={styles.costSubtitle}>Fleet-wide expenses</Text>
          </View>

          {/* Highest Maintenance Cost Vehicle */}
          {summary?.highestMaintenanceCostVehicle && (
            <View style={styles.costCard}>
              <View style={styles.costIconContainer}>
                <View style={[styles.costIcon, { backgroundColor: '#ef4444' }]}>
                  <MaterialIcons name="star" size={24} color="white" />
                </View>
              </View>
              <Text style={styles.costTitle}>Highest Cost Vehicle</Text>
              <Text style={[styles.costValue, { color: '#dc2626' }]}>
                ${summary.highestMaintenanceCostVehicle.maintenanceCost.toLocaleString()}
              </Text>
              <Text style={styles.costVehicleName}>{summary.highestMaintenanceCostVehicle.name}</Text>
              <Text style={styles.costLicensePlate}>
                {summary.highestMaintenanceCostVehicle.licensePlate || 'No license plate'}
              </Text>
            </View>
          )}

          {/* Lowest Maintenance Cost Vehicle */}
          {summary?.lowestMaintenanceCostVehicle && (
            <View style={styles.costCard}>
              <View style={styles.costIconContainer}>
                <View style={[styles.costIcon, { backgroundColor: '#10b981' }]}>
                  <MaterialCommunityIcons name="trending-down" size={24} color="white" />
                </View>
              </View>
              <Text style={styles.costTitle}>Lowest Cost Vehicle</Text>
              <Text style={[styles.costValue, { color: '#059669' }]}>
                ${summary.lowestMaintenanceCostVehicle.maintenanceCost.toLocaleString()}
              </Text>
              <Text style={styles.costVehicleName}>{summary.lowestMaintenanceCostVehicle.name}</Text>
              <Text style={styles.costLicensePlate}>
                {summary.lowestMaintenanceCostVehicle.licensePlate || 'No license plate'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Fleet Status Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fleet Status Overview</Text>
        <View style={styles.statusGrid}>
          <View style={[styles.statusCard, { backgroundColor: '#dcfce7' }]}>
            <Text style={[styles.statusValue, { color: '#166534' }]}>{vehicleStatusCounts.active}</Text>
            <Text style={[styles.statusLabel, { color: '#166534' }]}>Active</Text>
          </View>
          <View style={[styles.statusCard, { backgroundColor: '#fed7aa' }]}>
            <Text style={[styles.statusValue, { color: '#9a3412' }]}>{vehicleStatusCounts.maintenance}</Text>
            <Text style={[styles.statusLabel, { color: '#9a3412' }]}>Maintenance</Text>
          </View>
          <View style={[styles.statusCard, { backgroundColor: '#fecaca' }]}>
            <Text style={[styles.statusValue, { color: '#991b1b' }]}>{vehicleStatusCounts.idle}</Text>
            <Text style={[styles.statusLabel, { color: '#991b1b' }]}>Idle</Text>
          </View>
        </View>
      </View>

      {/* Maintenance Orders Status */}
      {summary?.maintenanceOrdersStatusCounts && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="wrench" size={20} color="#374151" />
            <Text style={styles.sectionTitleWithIcon}>Maintenance Orders Status</Text>
          </View>
          <View style={styles.maintenanceGrid}>
            <View style={[styles.maintenanceCard, { backgroundColor: '#dcfce7' }]}>
              <Text style={[styles.maintenanceValue, { color: '#166534' }]}>
                {summary.maintenanceOrdersStatusCounts.active}
              </Text>
              <Text style={[styles.maintenanceLabel, { color: '#166534' }]}>Active</Text>
              <Text style={[styles.maintenanceSubtext, { color: '#166534' }]}>In Progress</Text>
            </View>
            
            <View style={[styles.maintenanceCard, { backgroundColor: '#dbeafe' }]}>
              <Text style={[styles.maintenanceValue, { color: '#1e40af' }]}>
                {summary.maintenanceOrdersStatusCounts.scheduled}
              </Text>
              <Text style={[styles.maintenanceLabel, { color: '#1e40af' }]}>Scheduled</Text>
              <Text style={[styles.maintenanceSubtext, { color: '#1e40af' }]}>Upcoming</Text>
            </View>
            
            <View style={[styles.maintenanceCard, { backgroundColor: '#fef3c7' }]}>
              <Text style={[styles.maintenanceValue, { color: '#92400e' }]}>
                {summary.maintenanceOrdersStatusCounts.pending_authorization}
              </Text>
              <Text style={[styles.maintenanceLabel, { color: '#92400e' }]}>Pending Auth</Text>
              <Text style={[styles.maintenanceSubtext, { color: '#92400e' }]}>Awaiting Approval</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recent Vehicles */}
      <View style={styles.section}>
        <View style={styles.recentVehiclesHeader}>
          <Text style={styles.sectionTitle}>Recent Vehicles</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Vehicles')}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        
        {vehicles.length > 0 ? (
          <View style={styles.vehiclesList}>
            {vehicles.slice(0, 5).map((vehicle) => (
              <View key={vehicle.id} style={styles.vehicleCard}>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{vehicle.name}</Text>
                  <Text style={styles.vehicleDetails}>
                    {vehicle.make} {vehicle.model} {vehicle.year}
                  </Text>
                </View>
                <View style={styles.vehicleStatus}>
                  <Badge 
                    type={vehicle.status === 'active' ? 'green' : vehicle.status === 'maintenance' ? 'orange' : 'red'} 
                    label={vehicle.status === 'active' ? 'Active' : vehicle.status === 'maintenance' ? 'Maintenance' : 'Idle'} 
                  />
                  <Text style={styles.vehicleMileage}>
                    {vehicle.mileage?.toLocaleString() || 'N/A'} miles
                  </Text>
                  <Text style={styles.vehicleMaintenance}>
                    Next: {vehicle.nextMaintenance 
                      ? formatDate(vehicle.nextMaintenance)
                      : 'Not scheduled'
                    }
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="truck" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No vehicles found</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddVehicle')}
            >
              <Text style={styles.addButtonText}>Add your first vehicle</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
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
  errorText: {
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    padding: 24,
    paddingTop: 60, // Account for status bar
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
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionTitleWithIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
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
  statIconContainer: {
    marginRight: 20,
  },
  statIcon: {
    padding: 12,
    borderRadius: 6,
  },
  statInfo: {
    flex: 1,
  },
  statName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  costGrid: {
    gap: 16,
  },
  costCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  costIconContainer: {
    marginBottom: 16,
  },
  costIcon: {
    padding: 12,
    borderRadius: 6,
  },
  costTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  costValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  costSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  costVehicleName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  costLicensePlate: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  maintenanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  maintenanceCard: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  maintenanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  maintenanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  maintenanceSubtext: {
    fontSize: 10,
  },
  recentVehiclesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  vehiclesList: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  vehicleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  vehicleStatus: {
    alignItems: 'flex-end',
  },
  vehicleMileage: {
    fontSize: 12,
    color: '#111827',
    marginTop: 4,
  },
  vehicleMaintenance: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginVertical: 16,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
});