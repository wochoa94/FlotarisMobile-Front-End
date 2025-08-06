import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFleetData } from '../../../hooks/useFleetData';
import { useAuth } from '../../../hooks/useAuth';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatTooltipDate, getDaysBetweenDates, parseDate, parseDateEnd } from '../../../utils/dateUtils';
import { formatDate } from '../../../utils/dateUtils';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';

export function DriverDetailPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const { data, loading, error } = useFleetData();
  const { user } = useAuth();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <LoadingSpinner size="lg" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          onPress={() => navigation.goBack()}
          variant="primary"
        >
          Try again
        </Button>
      </View>
    );
  }

  const driver = data.drivers.find(d => d.id === id);
  
  // Get all vehicle schedules for this driver
  const driverSchedules = data.vehicleSchedules.filter(s => s.driverId === id);
  
  // Sort schedules by start date (most recent first)
  const sortedSchedules = [...driverSchedules].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Get vehicle name by ID
  const getVehicleName = (vehicleId: string): string => {
    const vehicle = data.vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  // Get vehicle details by ID
  const getVehicleDetails = (vehicleId: string) => {
    const vehicle = data.vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year}` : 'Unknown';
  };

  // Calculate schedule duration
  const getScheduleDuration = (startDate: string, endDate: string): string => {
    const startDateObj = parseDate(startDate);
    const endDateObj = parseDateEnd(endDate);
    const diffDays = getDaysBetweenDates(startDateObj, endDateObj);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  if (!driver) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Driver not found</Text>
        <Button 
          onPress={() => navigation.navigate('Drivers')}
          variant="primary"
        >
          Back to drivers
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Button
            onPress={() => navigation.navigate('Drivers')}
            variant="secondary"
            style={styles.backButton}
          >
            <View style={styles.backButtonContent}>
              <MaterialIcons name="arrow-back" size={16} color="#6b7280" />
              <Text style={styles.backButtonText}>Back to Drivers</Text>
            </View>
          </Button>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{driver.name}</Text>
            <Text style={styles.headerSubtitle}>{driver.email}</Text>
          </View>
        </View>
        {user?.isAdmin && (
          <Button
            onPress={() => navigation.navigate('EditDriver', { id: driver.id })}
            variant="primary"
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="edit" size={16} color="white" />
              <Text style={styles.buttonText}>Edit Driver</Text>
            </View>
          </Button>
        )}
      </View>

      {/* Driver Profile Card */}
      <Card style={styles.profileCard}>
        <CardBody>
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account" size={40} color="#8b5cf6" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{driver.name}</Text>
              <View style={styles.profileDetails}>
                <View style={styles.profileDetailItem}>
                  <MaterialIcons name="email" size={16} color="#6b7280" />
                  <Text style={styles.profileDetailText}>{driver.email}</Text>
                </View>
                {driver.address && (
                  <View style={styles.profileDetailItem}>
                    <MaterialIcons name="location-on" size={16} color="#6b7280" />
                    <Text style={styles.profileDetailText}>{driver.address}</Text>
                  </View>
                )}
                <View style={styles.profileDetailItem}>
                  <MaterialIcons name="event" size={16} color="#6b7280" />
                  <Text style={styles.profileDetailText}>
                    Driver since {formatDate(driver.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.profileStats}>
              <Text style={styles.statsNumber}>{driver.assignedVehicle ? 1 : 0}</Text>
              <Text style={styles.statsLabel}>Assigned Vehicle</Text>
            </View>
          </View>
        </CardBody>
      </Card>

      {/* Driver Information Grid */}
      <View style={styles.infoGrid}>
        {/* Personal Information */}
        <Card style={styles.infoCard}>
          <CardBody>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Driver ID</Text>
                <Text style={styles.infoValue}>{driver.id}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>ID Number</Text>
                <Text style={styles.infoValue}>{driver.idNumber}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{driver.age || 'Not specified'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{driver.email}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Full Address</Text>
                <Text style={styles.infoValue}>{driver.address || 'Not specified'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Created</Text>
                <Text style={styles.infoValue}>{formatDate(driver.createdAt)}</Text>
              </View>
            </View>
          </CardBody>
        </Card>

        {/* Driver Statistics */}
        <Card style={styles.infoCard}>
          <CardBody>
            <Text style={styles.sectionTitle}>Driver Statistics</Text>
            <View style={styles.statsList}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Assigned Vehicle</Text>
                <Text style={styles.statValue}>{driver.assignedVehicle ? 1 : 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Schedules</Text>
                <Text style={styles.statValue}>{driverSchedules.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Active Schedules</Text>
                <Text style={styles.statValue}>
                  {driverSchedules.filter(s => s.status === 'active').length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Vehicle Mileage</Text>
                <Text style={styles.statValue}>
                  {driver.assignedVehicle?.mileage?.toLocaleString() || '0'} miles
                </Text>
              </View>
            </View>
          </CardBody>
        </Card>
      </View>

      {/* Assignment History */}
      <Card style={styles.historyCard}>
        <CardBody>
          <View style={styles.historyHeader}>
            <MaterialIcons name="schedule" size={20} color="#6b7280" />
            <Text style={styles.historyTitle}>
              Assignment History ({sortedSchedules.length})
            </Text>
          </View>
          
          {sortedSchedules.length > 0 ? (
            <View style={styles.historyList}>
              {sortedSchedules.map((schedule) => (
                <View key={schedule.id} style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <Text style={styles.vehicleName}>
                      {getVehicleName(schedule.vehicleId)}
                    </Text>
                    <Badge 
                      type={schedule.status === 'active' ? 'green' : schedule.status === 'scheduled' ? 'blue' : 'gray'} 
                      label={schedule.status === 'active' ? 'Active' : schedule.status === 'scheduled' ? 'Scheduled' : 'Completed'} 
                    />
                  </View>
                  <Text style={styles.vehicleDetails}>
                    {getVehicleDetails(schedule.vehicleId)}
                  </Text>
                  <View style={styles.scheduleDetails}>
                    <Text style={styles.scheduleDate}>
                      {formatTooltipDate(schedule.startDate)} - {formatTooltipDate(schedule.endDate)}
                    </Text>
                    <Text style={styles.scheduleDuration}>
                      Duration: {getScheduleDuration(schedule.startDate, schedule.endDate)}
                    </Text>
                  </View>
                  {schedule.notes && (
                    <Text style={styles.scheduleNotes} numberOfLines={2}>
                      Notes: {schedule.notes}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <MaterialIcons name="schedule" size={48} color="#9ca3af" />
              <Text style={styles.emptyHistoryText}>
                No assignment history found for this driver
              </Text>
            </View>
          )}
        </CardBody>
      </Card>

      {/* Currently Assigned Vehicle */}
      <Card style={styles.assignedVehicleCard}>
        <CardBody>
          <View style={styles.assignedVehicleHeader}>
            <MaterialCommunityIcons name="truck" size={20} color="#6b7280" />
            <Text style={styles.assignedVehicleTitle}>Currently Assigned Vehicle</Text>
          </View>
          
          {driver.assignedVehicle ? (
            <View style={styles.assignedVehicleContent}>
              <View style={styles.assignedVehicleInfo}>
                <View style={styles.vehicleIconContainer}>
                  <MaterialCommunityIcons name="truck" size={24} color="#2563eb" />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.assignedVehicleName}>{driver.assignedVehicle.name}</Text>
                  <Text style={styles.assignedVehicleDetails}>
                    {driver.assignedVehicle.make} {driver.assignedVehicle.model} {driver.assignedVehicle.year}
                  </Text>
                  <Text style={styles.assignedVehicleDetails}>
                    License: {driver.assignedVehicle.licensePlate || 'Not specified'}
                  </Text>
                  <Text style={styles.assignedVehicleDetails}>
                    Mileage: {driver.assignedVehicle.mileage?.toLocaleString() || 'N/A'} miles
                  </Text>
                </View>
              </View>
              <Button
                onPress={() => navigation.navigate('VehicleDetail', { id: driver.assignedVehicle.id })}
                variant="primary"
              >
                View Vehicle Details
              </Button>
            </View>
          ) : (
            <View style={styles.emptyAssignedVehicle}>
              <MaterialCommunityIcons name="truck" size={48} color="#9ca3af" />
              <Text style={styles.emptyAssignedVehicleText}>
                No vehicle currently assigned to this driver
              </Text>
            </View>
          )}
        </CardBody>
      </Card>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
    gap: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6b7280',
    marginLeft: 4,
  },
  headerInfo: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f3e8ff',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  profileDetails: {
    gap: 4,
  },
  profileDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  profileStats: {
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statsLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoGrid: {
    gap: 24,
    marginBottom: 24,
  },
  infoCard: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 16,
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
  },
  statsList: {
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  statValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  historyCard: {
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  historyList: {
    gap: 16,
  },
  historyItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  scheduleDetails: {
    gap: 4,
    marginBottom: 8,
  },
  scheduleDate: {
    fontSize: 14,
    color: '#111827',
  },
  scheduleDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  scheduleNotes: {
    fontSize: 14,
    color: '#111827',
    fontStyle: 'italic',
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 32,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  assignedVehicleCard: {
    marginBottom: 24,
  },
  assignedVehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  assignedVehicleTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  assignedVehicleContent: {
    gap: 16,
  },
  assignedVehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#dbeafe',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  assignedVehicleName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  assignedVehicleDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  emptyAssignedVehicle: {
    alignItems: 'center',
    padding: 32,
  },
  emptyAssignedVehicleText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
});