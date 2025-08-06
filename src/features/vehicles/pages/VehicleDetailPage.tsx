import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useVehicleDetails } from '../hooks/useVehicleDetails';
import { useAuth } from '../../../hooks/useAuth';
import { vehicleService } from '../../../services/apiService';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatDate } from '../../../utils/dateUtils';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import { Card, CardBody } from '../../../components/ui/Card';

export function VehicleDetailPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const { vehicle, loading, error, refreshVehicle } = useVehicleDetails(id);
  const { user } = useAuth();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleDelete = async () => {
    if (!vehicle) return;

    setIsDeleting(true);
    setErrorMessage('');

    try {
      // Delete via API service
      await vehicleService.deleteVehicle(vehicle.id);

      // Success feedback
      setSuccessMessage('Vehicle deleted successfully!');
      
      // Close modal and redirect after a short delay
      setShowDeleteModal(false);
      setTimeout(() => {
        navigation.navigate('Vehicles');
      }, 1500);

    } catch (error) {
      console.error('Error deleting vehicle:', error);
      setErrorMessage(
        error instanceof Error 
          ? `Failed to delete vehicle: ${error.message}`
          : 'Failed to delete vehicle. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const dismissMessage = (type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage('');
    } else {
      setErrorMessage('');
    }
  };

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

  if (!vehicle) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Vehicle not found</Text>
        <Button 
          onPress={() => navigation.navigate('Vehicles')}
          variant="primary"
        >
          Back to vehicles
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Success Message */}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onDismiss={() => dismissMessage('success')}
        />
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onDismiss={() => dismissMessage('error')}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Vehicles')}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonContent}>
              <MaterialIcons name="arrow-back" size={16} color="#6b7280" />
              <Text style={styles.backButtonText}>Back to Vehicles</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{vehicle.name}</Text>
            <Text style={styles.headerSubtitle}>
              {vehicle.make} {vehicle.model} {vehicle.year}
            </Text>
          </View>
        </View>
        {user?.isAdmin && (
          <View style={styles.headerActions}>
            <Button
              onPress={() => navigation.navigate('EditVehicle', { id: vehicle.id })}
              variant="primary"
              style={styles.headerButton}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons name="edit" size={16} color="white" />
                <Text style={styles.buttonText}>Edit Vehicle</Text>
              </View>
            </Button>
            <Button
              onPress={() => setShowDeleteModal(true)}
              variant="danger"
              style={styles.headerButton}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons name="delete" size={16} color="white" />
                <Text style={styles.buttonText}>Delete Vehicle</Text>
              </View>
            </Button>
          </View>
        )}
      </View>

      {/* Status and Key Metrics */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <CardBody>
            <View style={styles.metricContent}>
              <View style={styles.metricIcon}>
                <MaterialIcons name="settings" size={24} color="#6b7280" />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Status</Text>
                <View style={styles.metricValue}>
                  <Badge 
                    type={vehicle.status === 'active' ? 'green' : vehicle.status === 'maintenance' ? 'orange' : 'red'} 
                    label={vehicle.status === 'active' ? 'Active' : vehicle.status === 'maintenance' ? 'Maintenance' : 'Idle'} 
                  />
                </View>
              </View>
            </View>
          </CardBody>
        </Card>

        <Card style={styles.metricCard}>
          <CardBody>
            <View style={styles.metricContent}>
              <View style={[styles.metricIcon, { backgroundColor: '#dbeafe' }]}>
                <MaterialCommunityIcons name="speedometer" size={24} color="#2563eb" />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Mileage</Text>
                <Text style={styles.metricValueText}>
                  {vehicle.mileage?.toLocaleString() || 'N/A'} miles
                </Text>
              </View>
            </View>
          </CardBody>
        </Card>

        <Card style={styles.metricCard}>
          <CardBody>
            <View style={styles.metricContent}>
              <View style={[styles.metricIcon, { backgroundColor: '#dcfce7' }]}>
                <MaterialIcons name="attach-money" size={24} color="#10b981" />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Maintenance Cost</Text>
                <Text style={styles.metricValueText}>
                  ${vehicle.maintenanceCost?.toLocaleString() || '0'}
                </Text>
              </View>
            </View>
          </CardBody>
        </Card>

        <Card style={styles.metricCard}>
          <CardBody>
            <View style={styles.metricContent}>
              <View style={[styles.metricIcon, { backgroundColor: '#f3e8ff' }]}>
                <MaterialCommunityIcons name="account" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Assigned Driver</Text>
                <Text style={styles.metricValueText}>
                  {vehicle?.assignedDriverName || 'Unassigned'}
                </Text>
              </View>
            </View>
          </CardBody>
        </Card>
      </View>

      {/* Detailed Information */}
      <View style={styles.detailsGrid}>
        {/* Vehicle Information */}
        <Card style={styles.detailCard}>
          <CardBody>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Vehicle ID</Text>
                <Text style={[styles.detailValue, styles.monoText]}>{vehicle.id}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>VIN</Text>
                <Text style={[styles.detailValue, styles.monoText]}>{vehicle.vin || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>License Plate</Text>
                <Text style={styles.detailValue}>{vehicle.licensePlate || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Make</Text>
                <Text style={styles.detailValue}>{vehicle.make || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Model</Text>
                <Text style={styles.detailValue}>{vehicle.model || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Year</Text>
                <Text style={styles.detailValue}>{vehicle.year || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Fuel Type</Text>
                <Text style={styles.detailValue}>{vehicle.fuelType || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Created</Text>
                <Text style={styles.detailValue}>
                  {formatDate(vehicle.createdAt)}
                </Text>
              </View>
            </View>
          </CardBody>
        </Card>

        {/* Maintenance Information */}
        <Card style={styles.detailCard}>
          <CardBody>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="event" size={20} color="#6b7280" />
              <Text style={styles.sectionTitleWithIcon}>Maintenance Information</Text>
            </View>
            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Last Maintenance</Text>
                <Text style={styles.detailValue}>
                  {vehicle.lastMaintenance 
                    ? formatDate(vehicle.lastMaintenance)
                    : 'Never'
                  }
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Next Maintenance</Text>
                <Text style={styles.detailValue}>
                  {vehicle.nextMaintenance 
                    ? formatDate(vehicle.nextMaintenance)
                    : 'Not scheduled'
                  }
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total Maintenance Cost</Text>
                <Text style={styles.detailValueLarge}>
                  ${vehicle.maintenanceCost?.toLocaleString() || '0'}
                </Text>
              </View>
              
              {vehicle.nextMaintenance && (
                <View style={styles.maintenanceAlert}>
                  {(() => {
                    const nextMaintenanceDate = new Date(vehicle.nextMaintenance);
                    const today = new Date();
                    const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (daysUntilMaintenance <= 0) {
                      return (
                        <View style={styles.overdueAlert}>
                          <Text style={styles.overdueText}>
                            ⚠️ Maintenance is overdue!
                          </Text>
                        </View>
                      );
                    } else if (daysUntilMaintenance <= 30) {
                      return (
                        <View style={styles.upcomingAlert}>
                          <Text style={styles.upcomingText}>
                            ⚡ Maintenance due in {daysUntilMaintenance} days
                          </Text>
                        </View>
                      );
                    } else {
                      return (
                        <View style={styles.goodAlert}>
                          <Text style={styles.goodText}>
                            ✅ Next maintenance in {daysUntilMaintenance} days
                          </Text>
                        </View>
                      );
                    }
                  })()}
                </View>
              )}
            </View>
          </CardBody>
        </Card>
      </View>

      {/* Assigned Driver Details */}
      {vehicle?.assignedDriverName && vehicle?.assignedDriverId && (
        <Card style={styles.driverCard}>
          <CardBody>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account" size={20} color="#6b7280" />
              <Text style={styles.sectionTitleWithIcon}>Assigned Driver Details</Text>
            </View>
            <View style={styles.driverContent}>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <MaterialCommunityIcons name="account" size={24} color="#8b5cf6" />
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{vehicle.assignedDriverName}</Text>
                  <Text style={styles.driverEmail}>{vehicle.assignedDriverEmail || 'No email'}</Text>
                  <Text style={styles.driverId}>Driver ID: {vehicle.assignedDriverId}</Text>
                </View>
              </View>
              <Button
                onPress={() => navigation.navigate('DriverDetail', { id: vehicle.assignedDriverId })}
                variant="secondary"
              >
                View Driver Details
              </Button>
            </View>
          </CardBody>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        headerContent={
          <View style={styles.deleteModalHeader}>
            <MaterialIcons name="warning" size={24} color="#ef4444" />
            <Text style={styles.deleteModalTitle}>Delete Vehicle</Text>
          </View>
        }
        footerContent={
          <View style={styles.deleteModalFooter}>
            <Button
              onPress={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              variant="secondary"
              style={styles.modalFooterButton}
            >
              Cancel
            </Button>
            <Button
              onPress={handleDelete}
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
                  <Text style={styles.deleteButtonText}>Confirm Delete</Text>
                </View>
              )}
            </Button>
          </View>
        }
      >
        <View style={styles.deleteModalContent}>
          <Text style={styles.deleteWarningText}>
            <Text style={styles.deleteWarningBold}>Warning:</Text> This action cannot be undone. Are you sure you want to permanently delete this vehicle?
          </Text>
          <View style={styles.vehiclePreview}>
            <Text style={styles.vehiclePreviewName}>{vehicle.name}</Text>
            <Text style={styles.vehiclePreviewDetails}>{vehicle.make} {vehicle.model} {vehicle.year}</Text>
            <Text style={styles.vehiclePreviewLicense}>License: {vehicle.licensePlate}</Text>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6b7280',
    marginLeft: 4,
    fontSize: 14,
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
  headerActions: {
    gap: 12,
    marginLeft: 16,
  },
  headerButton: {
    minWidth: 120,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
  },
  metricsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    marginBottom: 0,
  },
  metricContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  metricValue: {
    gap: 4,
  },
  metricValueText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  detailsGrid: {
    gap: 24,
    marginBottom: 24,
  },
  detailCard: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleWithIcon: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  detailsList: {
    gap: 16,
  },
  detailItem: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
  },
  detailValueLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  maintenanceAlert: {
    marginTop: 16,
  },
  overdueAlert: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 6,
    padding: 12,
  },
  overdueText: {
    fontSize: 14,
    color: '#991b1b',
  },
  upcomingAlert: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 6,
    padding: 12,
  },
  upcomingText: {
    fontSize: 14,
    color: '#92400e',
  },
  goodAlert: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 6,
    padding: 12,
  },
  goodText: {
    fontSize: 14,
    color: '#166534',
  },
  driverCard: {
    marginBottom: 24,
  },
  driverContent: {
    gap: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#f3e8ff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  driverEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  driverId: {
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
  modalFooterButton: {
    flex: 1,
  },
  deleteModalContent: {
    gap: 16,
  },
  deleteWarningText: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteWarningBold: {
    fontWeight: 'bold',
  },
  vehiclePreview: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 12,
  },
  vehiclePreviewName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  vehiclePreviewDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  vehiclePreviewLicense: {
    fontSize: 14,
    color: '#6b7280',
  },
  deletingText: {
    color: 'white',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: 'white',
    marginLeft: 8,
  },
});