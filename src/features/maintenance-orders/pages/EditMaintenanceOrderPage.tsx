import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { useFleetData } from '../../../hooks/useFleetData';
import { maintenanceOrderService } from '../../../services/apiService';
import { formatUtcDateForInput, getTodayString } from '../../../utils/dateUtils';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';

interface EditMaintenanceOrderFormData {
  vehicleId: string;
  description: string;
  startDate: string;
  estimatedCompletionDate: string;
  location: string;
  type: string;
  urgent: boolean;
  quotationDetails: string;
  comments: string;
  cost: string;
}

export function EditMaintenanceOrderPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const { user } = useAuth();
  const { data, loading, error, refreshData } = useFleetData();
  
  const [formData, setFormData] = useState<EditMaintenanceOrderFormData>({
    vehicleId: '',
    description: '',
    startDate: '',
    estimatedCompletionDate: '',
    location: '',
    type: '',
    urgent: false,
    quotationDetails: '',
    comments: '',
    cost: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const order = data.maintenanceOrders.find(o => o.id === id);
  const vehicle = order ? data.vehicles.find(v => v.id === order.vehicleId) : null;

  // Initialize form data when order is loaded
  useEffect(() => {
    if (order) {
      setFormData({
        vehicleId: order.vehicleId,
        description: order.description || '',
        // Format UTC date from order to local YYYY-MM-DD for date input
        startDate: order.startDate ? formatUtcDateForInput(order.startDate) : '',
        estimatedCompletionDate: order.estimatedCompletionDate ? formatUtcDateForInput(order.estimatedCompletionDate) : '',
        location: order.location || '',
        type: order.type || '',
        urgent: order.urgent || false,
        quotationDetails: order.quotationDetails || '',
        comments: order.comments || '',
        cost: order.cost?.toString() || '',
      });
    }
  }, [order]);

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

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.vehicleId) return 'Vehicle selection is required';
    if (!formData.description.trim()) return 'Service description is required';
    if (!formData.startDate) return 'Start date is required';
    if (!formData.estimatedCompletionDate) return 'Estimated completion date is required';
    
    // Date validation
    const startDate = new Date(formData.startDate);
    const completionDate = new Date(formData.estimatedCompletionDate);
    
    if (completionDate <= startDate) {
      return 'Estimated completion date must be after start date';
    }
    
    // Cost validation (if provided)
    if (formData.cost.trim() && (isNaN(Number(formData.cost)) || Number(formData.cost) < 0)) {
      return 'Please enter a valid cost amount';
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!order) return;
    
    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare update data (excluding status which should not be changed here)
      const updateData = {
        vehicleId: formData.vehicleId,
        description: formData.description.trim(),
        startDate: formData.startDate,
        estimatedCompletionDate: formData.estimatedCompletionDate,
        location: formData.location.trim() || null,
        type: formData.type.trim() || null,
        urgent: formData.urgent,
        quotationDetails: formData.quotationDetails.trim() || null,
        comments: formData.comments.trim() || null,
        cost: formData.cost.trim() ? Number(formData.cost) : null,
      };

      // Update via API service
      await maintenanceOrderService.updateMaintenanceOrder(order.id, updateData);

      // Success feedback
      setSuccessMessage('Maintenance order updated successfully!');
      
      // Refresh fleet data
      await refreshData();
      
      // Redirect to order detail page after a short delay
      setTimeout(() => {
        navigation.navigate('MaintenanceOrderDetail', { id: order.id });
      }, 1500);

    } catch (error) {
      console.error('Error updating maintenance order:', error);
      setErrorMessage(
        error instanceof Error 
          ? `Failed to update maintenance order: ${error.message}`
          : 'Failed to update maintenance order. Please try again.'
      );
    } finally {
      setIsLoading(false);
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

  // Filter available vehicles (current vehicle + vehicles not in maintenance)
  const availableVehicles = data.vehicles.filter(v => 
    v.id === order.vehicleId || v.status !== 'maintenance'
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.navigate('MaintenanceOrderDetail', { id: order.id })}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <View style={styles.backButtonContent}>
                <MaterialIcons name="arrow-back" size={16} color="#6b7280" />
                <Text style={styles.backButtonText}>Back to Order Details</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Edit Maintenance Order</Text>
              <Text style={styles.headerSubtitle}>
                Order #{order.orderNumber}
              </Text>
            </View>
          </View>
        </View>

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

        {/* Current Order Info */}
        <View style={styles.currentOrderInfo}>
          <Text style={styles.currentOrderTitle}>Current Order Information</Text>
          <View style={styles.currentOrderGrid}>
            <View style={styles.currentOrderItem}>
              <Text style={styles.currentOrderLabel}>Status:</Text>
              <Text style={styles.currentOrderValue}>{order.status.replace('_', ' ')}</Text>
            </View>
            <View style={styles.currentOrderItem}>
              <Text style={styles.currentOrderLabel}>Vehicle:</Text>
              <Text style={styles.currentOrderValue}>{vehicle?.name || 'Unknown Vehicle'}</Text>
            </View>
            <View style={styles.currentOrderItem}>
              <Text style={styles.currentOrderLabel}>Created:</Text>
              <Text style={styles.currentOrderValue}>{new Date(order.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        {/* Edit Form */}
        <View style={styles.formContainer}>
          <View style={styles.formContent}>
            {/* Vehicle Selection */}
            <View style={styles.inputGroup}>
              <Label>Vehicle *</Label>
              <Input
                as="select"
                selectedValue={formData.vehicleId}
                onValueChange={(value) => handleInputChange('vehicleId', value)}
                enabled={!isLoading}
              >
                <Input.Item label="Select a vehicle" value="" />
                {availableVehicles.map((vehicle) => (
                  <Input.Item 
                    key={vehicle.id} 
                    label={`${vehicle.name} - ${vehicle.make} ${vehicle.model} ${vehicle.year}`}
                    value={vehicle.id}
                  />
                ))}
              </Input>
            </View>

            {/* Service Description */}
            <View style={styles.inputGroup}>
              <Label>Service Description *</Label>
              <Input
                as="textarea"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Describe the maintenance work to be performed..."
                rows={4}
                editable={!isLoading}
              />
            </View>

            {/* Start Date */}
            <View style={styles.inputGroup}>
              <Label>Start Date *</Label>
              <Input
                value={formData.startDate}
                onChangeText={(value) => handleInputChange('startDate', value)}
                placeholder="YYYY-MM-DD"
                editable={!isLoading}
              />
            </View>

            {/* Estimated Completion Date */}
            <View style={styles.inputGroup}>
              <Label>Estimated Completion Date *</Label>
              <Input
                value={formData.estimatedCompletionDate}
                onChangeText={(value) => handleInputChange('estimatedCompletionDate', value)}
                placeholder="YYYY-MM-DD"
                editable={!isLoading}
              />
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholder="e.g., Main Garage, Service Center A"
                editable={!isLoading}
              />
            </View>

            {/* Type */}
            <View style={styles.inputGroup}>
              <Label>Maintenance Type</Label>
              <Input
                as="select"
                selectedValue={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
                enabled={!isLoading}
              >
                <Input.Item label="Select type" value="" />
                <Input.Item label="Preventive" value="Preventive" />
                <Input.Item label="Corrective" value="Corrective" />
                <Input.Item label="Emergency" value="Emergency" />
                <Input.Item label="Inspection" value="Inspection" />
                <Input.Item label="Repair" value="Repair" />
                <Input.Item label="Service" value="Service" />
              </Input>
            </View>

            {/* Urgent Checkbox */}
            <View style={styles.checkboxGroup}>
              <TouchableOpacity
                style={styles.checkboxItem}
                onPress={() => handleInputChange('urgent', !formData.urgent)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  formData.urgent && styles.checkboxChecked
                ]}>
                  {formData.urgent && (
                    <MaterialIcons name="check" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Mark as urgent</Text>
              </TouchableOpacity>
              <Text style={styles.inputHint}>
                Urgent orders will be prioritized and highlighted in the system
              </Text>
            </View>

            {/* Cost */}
            <View style={styles.inputGroup}>
              <Label>Estimated Cost</Label>
              <Input
                value={formData.cost}
                onChangeText={(value) => handleInputChange('cost', value)}
                placeholder="0.00"
                keyboardType="numeric"
                editable={!isLoading}
              />
            </View>

            {/* Status (Read-only) */}
            <View style={styles.inputGroup}>
              <Label>Status (Read-only)</Label>
              <Input
                value={order.status.replace('_', ' ').toUpperCase()}
                editable={false}
                style={styles.readOnlyInput}
              />
              <Text style={styles.inputHint}>
                Status cannot be changed through editing. Use authorization workflow for status changes.
              </Text>
            </View>

            {/* Quotation Details */}
            <View style={styles.inputGroup}>
              <Label>Quotation Details</Label>
              <Input
                as="textarea"
                value={formData.quotationDetails}
                onChangeText={(value) => handleInputChange('quotationDetails', value)}
                placeholder="Detailed breakdown of costs, parts, labor, etc..."
                rows={3}
                editable={!isLoading}
              />
            </View>

            {/* Comments */}
            <View style={styles.inputGroup}>
              <Label>Comments</Label>
              <Input
                as="textarea"
                value={formData.comments}
                onChangeText={(value) => handleInputChange('comments', value)}
                placeholder="Additional notes or special instructions..."
                rows={3}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Form Actions */}
          <View style={styles.formActions}>
            <Button
              onPress={() => navigation.navigate('MaintenanceOrderDetail', { id: order.id })}
              variant="secondary"
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmit}
              disabled={isLoading}
              variant="primary"
              style={styles.actionButton}
            >
              {isLoading ? (
                <View style={styles.loadingContent}>
                  <LoadingSpinner size="sm" color="white" />
                  <Text style={styles.loadingText}>Updating Order...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialIcons name="save" size={16} color="white" />
                  <Text style={styles.buttonText}>Update Order</Text>
                </View>
              )}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 24,
  },
  headerContent: {
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
  currentOrderInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  currentOrderTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  currentOrderGrid: {
    gap: 16,
  },
  currentOrderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentOrderLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  currentOrderValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textTransform: 'capitalize',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  formContent: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
  },
  checkboxGroup: {
    gap: 8,
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
    color: '#111827',
  },
  readOnlyInput: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    marginLeft: 8,
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
});