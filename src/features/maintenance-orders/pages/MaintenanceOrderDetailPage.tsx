import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFleetData } from '../../../hooks/useFleetData';
import { useAuth } from '../../../hooks/useAuth';
import { maintenanceOrderService } from '../../../services/apiService';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { AuthorizeMaintenanceOrderModal } from '../components/AuthorizeMaintenanceOrderModal';
import { formatDate } from '../../../utils/dateUtils';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { Card, CardBody } from '../../../components/ui/Card';

// Enhanced error parsing function
function parseBackendError(error: Error): { type: 'validation' | 'conflict' | 'authorization' | 'network' | 'generic'; message: string } {
  const errorMessage = error.message.toLowerCase();
  
  // Check for specific backend validation errors
  if (errorMessage.includes('conflict') || 
      errorMessage.includes('overlap') || 
      errorMessage.includes('unavailable') ||
      errorMessage.includes('already scheduled') ||
      errorMessage.includes('maintenance period')) {
    return {
      type: 'conflict',
      message: error.message
    };
  }
  
  if (errorMessage.includes('validation') || 
      errorMessage.includes('invalid') || 
      errorMessage.includes('required') ||
      errorMessage.includes('missing')) {
    return {
      type: 'validation',
      message: error.message
    };
  }
  
  if (errorMessage.includes('authorization') || 
      errorMessage.includes('permission') || 
      errorMessage.includes('access denied') ||
      errorMessage.includes('unauthorized')) {
    return {
      type: 'authorization',
      message: error.message
    };
  }
  
  if (errorMessage.includes('network') || 
      errorMessage.includes('connection') || 
      errorMessage.includes('timeout') ||
      errorMessage.includes('fetch')) {
    return {
      type: 'network',
      message: 'Network error. Please check your connection and try again.'
    };
  }
  
  return {
    type: 'generic',
    message: error.message
  };
}

export function MaintenanceOrderDetailPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const { data, loading, error, refreshData } = useFleetData();
  const { user } = useAuth();

  const [showAuthorizeModal, setShowAuthorizeModal] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState<'validation' | 'conflict' | 'authorization' | 'network' | 'generic'>('generic');

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
        setErrorType('generic');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleAuthorize = async (authData: { cost: number; quotationDetails: string; comments: string }) => {
    if (!order) return;

    setIsAuthorizing(true);
    setErrorMessage('');
    setErrorType('generic');

    try {
      // Update maintenance order status and details via API service
      await maintenanceOrderService.updateMaintenanceOrderStatus(order.id, 'scheduled', {
        cost: authData.cost,
        quotationDetails: authData.quotationDetails,
        comments: authData.comments,
      });

      // Success feedback
      setSuccessMessage('Maintenance order authorized successfully! Status changed to Scheduled.');
      
      // Refresh fleet data
      await refreshData();
      
      // Close modal
      setShowAuthorizeModal(false);

    } catch (error) {
      console.error('Error authorizing maintenance order:', error);
      
      // Enhanced error handling with specific error types
      const parsedError = parseBackendError(error as Error);
      setErrorType(parsedError.type);
      
      // Set user-friendly error messages based on error type
      switch (parsedError.type) {
        case 'conflict':
          setErrorMessage(`Schedule Conflict: ${parsedError.message}`);
          break;
        case 'validation':
          setErrorMessage(`Validation Error: ${parsedError.message}`);
          break;
        case 'authorization':
          setErrorMessage(`Authorization Error: ${parsedError.message}`);
          break;
        case 'network':
          setErrorMessage(parsedError.message);
          break;
        default:
          setErrorMessage(`Failed to authorize maintenance order: ${parsedError.message}`);
      }
    } finally {
      setIsAuthorizing(false);
    }
  };

  const dismissMessage = (type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage('');
    } else {
      setErrorMessage('');
      setErrorType('generic');
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

  const order = data.maintenanceOrders.find(o => o.id === id);
  const vehicle = order ? data.vehicles.find(v => v.id === order.vehicleId) : null;
  const assignedDriver = vehicle?.assignedDriverId 
    ? data.drivers.find(d => d.id === vehicle.assignedDriverId)
    : null;

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Maintenance order not found</Text>
        <Button 
          onPress={() => navigation.navigate('MaintenanceOrders')}
          variant="primary"
        >
          Back to maintenance orders
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

      {/* Enhanced Error Message with Type-specific Styling */}
      {errorMessage && (
        <Alert
          type={errorType}
          message={errorMessage}
          onDismiss={() => dismissMessage('error')}
        >
          <View style={styles.errorBadges}>
            {errorType === 'conflict' && (
              <Badge type="orange" label="Schedule Conflict" size="sm" />
            )}
            {errorType === 'validation' && (
              <Badge type="yellow" label="Validation Error" size="sm" />
            )}
            {errorType === 'authorization' && (
              <Badge type="purple" label="Authorization Error" size="sm" />
            )}
            {errorType === 'network' && (
              <Badge type="blue" label="Network Error" size="sm" />
            )}
          </View>
          {/* Additional context for specific error types */}
          {errorType === 'conflict' && (
            <Text style={styles.errorContext}>
              This maintenance order conflicts with existing schedules. Please check the vehicle's current assignments.
            </Text>
          )}
          {errorType === 'network' && (
            <Text style={styles.errorContext}>
              Please check your internet connection and try again. If the problem persists, contact support.
            </Text>
          )}
        </Alert>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.navigate('MaintenanceOrders')}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonContent}>
              <MaterialIcons name="arrow-back" size={16} color="#6b7280" />
              <Text style={styles.backButtonText}>Back to Maintenance Orders</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
            <Text style={styles.headerSubtitle}>
              {vehicle ? `${vehicle.name} - ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
            </Text>
          </View>
        </View>
        {user?.isAdmin && (
          <View style={styles.headerActions}>
            <Button
              onPress={() => navigation.navigate('EditMaintenanceOrder', { id: order.id })}
              variant="primary"
              style={styles.headerButton}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons name="edit" size={16} color="white" />
                <Text style={styles.buttonText}>Edit Order</Text>
              </View>
            </Button>
            
            {/* Authorize Order Button - Only show for admins and pending authorization orders */}
            {order.status === 'pending_authorization' && (
              <Button
                onPress={() => setShowAuthorizeModal(true)}
                variant="primary"
                style={[styles.headerButton, styles.authorizeButton]}
              >
                <View style={styles.buttonContent}>
                  <MaterialIcons name="check-circle" size={16} color="white" />
                  <Text style={styles.buttonText}>Authorize Order</Text>
                </View>
              </Button>
            )}
          </View>
        )}
      </View>

      {/* Status and Key Metrics */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <CardBody>
            <View style={styles.metricContent}>
              <View style={styles.metricIcon}>
                <MaterialIcons name="description" size={24} color="#6b7280" />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Status</Text>
                <View style={styles.metricValue}>
                  <Badge 
                    type={order.status === 'active' ? 'green' : order.status === 'scheduled' ? 'blue' : order.status === 'pending_authorization' ? 'yellow' : 'gray'} 
                    label={order.status === 'active' ? 'Active' : order.status === 'scheduled' ? 'Scheduled' : order.status === 'pending_authorization' ? 'Pending Authorization' : 'Completed'} 
                  />
                  {order.urgent && (
                    <View style={styles.urgentBadge}>
                      <Badge type="red" label="Urgent" size="sm">
                        <MaterialIcons name="warning" size={12} color="#991b1b" />
                      </Badge>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </CardBody>
        </Card>

        <Card style={styles.metricCard}>
          <CardBody>
            <View style={styles.metricContent}>
              <View style={[styles.metricIcon, { backgroundColor: '#dbeafe' }]}>
                <MaterialIcons name="event" size={24} color="#2563eb" />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Start Date</Text>
                <Text style={styles.metricValueText}>
                  {formatDate(order.startDate)}
                </Text>
              </View>
            </View>
          </CardBody>
        </Card>

        <Card style={styles.metricCard}>
          <CardBody>
            <View style={styles.metricContent}>
              <View style={[styles.metricIcon, { backgroundColor: '#dcfce7' }]}>
                <MaterialIcons name="schedule" size={24} color="#10b981" />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Est. Completion</Text>
                <Text style={styles.metricValueText}>
                  {formatDate(order.estimatedCompletionDate)}
                </Text>
              </View>
            </View>
          </CardBody>
        </Card>

        <Card style={styles.metricCard}>
          <CardBody>
            <View style={styles.metricContent}>
              <View style={[styles.metricIcon, { backgroundColor: '#f3e8ff' }]}>
                <MaterialIcons name="attach-money" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>Cost</Text>
                <Text style={styles.metricValueText}>
                  {order.cost ? `$${order.cost.toLocaleString()}` : 'N/A'}
                </Text>
              </View>
            </View>
          </CardBody>
        </Card>
      </View>

      {/* Detailed Information */}
      <View style={styles.detailsGrid}>
        {/* Order Information */}
        <Card style={styles.detailCard}>
          <CardBody>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Order ID</Text>
                <Text style={[styles.detailValue, styles.monoText]}>{order.id}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Order Number</Text>
                <Text style={[styles.detailValue, styles.monoText]}>{order.orderNumber}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <Badge 
                  type={order.status === 'active' ? 'green' : order.status === 'scheduled' ? 'blue' : order.status === 'pending_authorization' ? 'yellow' : 'gray'} 
                  label={order.status === 'active' ? 'Active' : order.status === 'scheduled' ? 'Scheduled' : order.status === 'pending_authorization' ? 'Pending Authorization' : 'Completed'} 
                />
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Start Date</Text>
                <Text style={styles.detailValue}>{formatDate(order.startDate)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Estimated Completion Date</Text>
                <Text style={styles.detailValue}>{formatDate(order.estimatedCompletionDate)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Location</Text>
                {order.location ? (
                  <View style={styles.locationContainer}>
                    <MaterialIcons name="place" size={16} color="#6b7280" />
                    <Text style={styles.locationText}>{order.location}</Text>
                  </View>
                ) : (
                  <Text style={styles.detailValue}>Not specified</Text>
                )}
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{order.type || 'Not specified'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Priority</Text>
                {order.urgent ? (
                  <Badge type="red" label="Urgent" size="sm">
                    <MaterialIcons name="warning" size={12} color="#991b1b" />
                  </Badge>
                ) : (
                  <Text style={styles.detailValue}>Normal</Text>
                )}
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Cost</Text>
                <Text style={styles.detailValue}>
                  {order.cost ? `$${order.cost.toLocaleString()}` : 'Not specified'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Created</Text>
                <Text style={styles.detailValue}>{formatDate(order.createdAt)}</Text>
              </View>
            </View>
          </CardBody>
        </Card>

        {/* Vehicle Information */}
        <Card style={styles.detailCard}>
          <CardBody>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="truck" size={20} color="#6b7280" />
              <Text style={styles.sectionTitleWithIcon}>Vehicle Information</Text>
            </View>
            {vehicle ? (
              <View style={styles.detailsList}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Vehicle Name</Text>
                  <Text style={styles.detailValue}>{vehicle.name}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Make/Model/Year</Text>
                  <Text style={styles.detailValue}>
                    {vehicle.make} {vehicle.model} {vehicle.year}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>License Plate</Text>
                  <Text style={styles.detailValue}>{vehicle.licensePlate || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>VIN</Text>
                  <Text style={[styles.detailValue, styles.monoText]}>{vehicle.vin || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Current Mileage</Text>
                  <Text style={styles.detailValue}>
                    {vehicle.mileage?.toLocaleString() || 'N/A'} miles
                  </Text>
                </View>
                <View style={styles.detailActions}>
                  <Button
                    onPress={() => navigation.navigate('VehicleDetail', { id: vehicle.id })}
                    variant="secondary"
                  >
                    View Vehicle Details
                  </Button>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>Vehicle information not available</Text>
            )}
          </CardBody>
        </Card>
      </View>

      {/* Order Description */}
      {order.description && (
        <Card style={styles.descriptionCard}>
          <CardBody>
            <Text style={styles.sectionTitle}>Service Description</Text>
            <View style={styles.descriptionContent}>
              <Text style={styles.descriptionText}>{order.description}</Text>
            </View>
          </CardBody>
        </Card>
      )}

      {/* Quotation Details */}
      {order.quotationDetails && (
        <Card style={styles.quotationCard}>
          <CardBody>
            <Text style={styles.sectionTitle}>Quotation Details</Text>
            <View style={styles.quotationContent}>
              <Text style={styles.quotationText}>{order.quotationDetails}</Text>
            </View>
          </CardBody>
        </Card>
      )}

      {/* Comments */}
      {order.comments && (
        <Card style={styles.commentsCard}>
          <CardBody>
            <Text style={styles.sectionTitle}>Comments</Text>
            <View style={styles.commentsContent}>
              <Text style={styles.commentsText}>{order.comments}</Text>
            </View>
          </CardBody>
        </Card>
      )}

      {/* Assigned Driver */}
      {assignedDriver && (
        <Card style={styles.driverCard}>
          <CardBody>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account" size={20} color="#6b7280" />
              <Text style={styles.sectionTitleWithIcon}>Assigned Driver</Text>
            </View>
            <View style={styles.driverContent}>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <MaterialCommunityIcons name="account" size={24} color="#8b5cf6" />
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{assignedDriver.name}</Text>
                  <Text style={styles.driverEmail}>{assignedDriver.email}</Text>
                  <Text style={styles.driverId}>ID: {assignedDriver.idNumber}</Text>
                </View>
              </View>
              <Button
                onPress={() => navigation.navigate('DriverDetail', { id: assignedDriver.id })}
                variant="secondary"
              >
                View Driver Details
              </Button>
            </View>
          </CardBody>
        </Card>
      )}

      {/* Authorization Modal */}
      <AuthorizeMaintenanceOrderModal
        isOpen={showAuthorizeModal}
        onClose={() => setShowAuthorizeModal(false)}
        onAuthorize={handleAuthorize}
        order={order}
        isLoading={isAuthorizing}
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
  errorBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  errorContext: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.75,
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
  authorizeButton: {
    backgroundColor: '#10b981',
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
  urgentBadge: {
    marginTop: 4,
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
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 4,
  },
  detailActions: {
    marginTop: 16,
  },
  noDataText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  descriptionCard: {
    marginBottom: 24,
  },
  descriptionContent: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  quotationCard: {
    marginBottom: 24,
  },
  quotationContent: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    padding: 16,
  },
  quotationText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  commentsCard: {
    marginBottom: 24,
  },
  commentsContent: {
    backgroundColor: '#fffbeb',
    borderRadius: 6,
    padding: 16,
  },
  commentsText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
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
});