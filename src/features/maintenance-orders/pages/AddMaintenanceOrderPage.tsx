import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { useFleetData } from '../../../hooks/useFleetData';
import { maintenanceOrderService } from '../../../services/apiService';
import { getTodayString } from '../../../utils/dateUtils';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';

interface MaintenanceOrderFormData {
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

export function AddMaintenanceOrderPage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data, refreshData } = useFleetData();
  
  const [formData, setFormData] = useState<MaintenanceOrderFormData>({
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

  const generateOrderNumber = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MO-${timestamp}-${random}`;
  };

  const validateForm = (): string | null => {
    if (!formData.vehicleId) return 'Vehicle selection is required';
    if (!formData.description.trim()) return 'Service description is required';
    if (!formData.startDate) return 'Start date is required';
    if (!formData.estimatedCompletionDate) return 'Estimated completion date is required';
    if (!formData.cost.trim()) return 'Cost is required';
    
    // Date validation
    const startDate = new Date(formData.startDate);
    const completionDate = new Date(formData.estimatedCompletionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      return 'Start date cannot be in the past';
    }
    
    if (completionDate <= startDate) {
      return 'Estimated completion date must be after start date';
    }
    
    // Cost validation
    if (isNaN(Number(formData.cost)) || Number(formData.cost) < 0) {
      return 'Please enter a valid cost amount';
    }

    return null;
  };

  const handleSubmit = async () => {
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
      // Prepare maintenance order data
      const orderData = {
        vehicleId: formData.vehicleId,
        status: 'pending_authorization' as const,
        startDate: formData.startDate,
        estimatedCompletionDate: formData.estimatedCompletionDate,
        orderNumber: generateOrderNumber(),
        location: formData.location.trim() || null,
        type: formData.type.trim() || null,
        urgent: formData.urgent,
        description: formData.description.trim(),
        quotationDetails: formData.quotationDetails.trim() || null,
        comments: formData.comments.trim() || null,
        cost: Number(formData.cost),
      };

      // Add maintenance order via API service - backend will handle overlap validation
      await maintenanceOrderService.addMaintenanceOrder(orderData);

      // Success feedback
      setSuccessMessage('Maintenance order created successfully!');
      
      // Refresh fleet data
      await refreshData();
      
      // Redirect to maintenance orders page after a short delay
      setTimeout(() => {
        navigation.navigate('MaintenanceOrders');
      }, 1500);

    } catch (error) {
      console.error('Error creating maintenance order:', error);
      
      // Handle specific backend validation errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to create maintenance order. Please try again.';
      
      // Check for overlap-related errors from backend
      if (errorMessage.includes('unavailable') || 
          errorMessage.includes('conflict') || 
          errorMessage.includes('overlap') ||
          errorMessage.includes('maintenance') ||
          errorMessage.includes('scheduled') ||
          errorMessage.includes('active')) {
        setErrorMessage(`Schedule conflict: ${errorMessage}`);
      } else {
        setErrorMessage(`Failed to create maintenance order: ${errorMessage}`);
      }
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

  // Filter available vehicles (not currently in maintenance)
  const availableVehicles = data.vehicles.filter(vehicle => vehicle.status !== 'maintenance');

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
              <Text style={styles.headerTitle}>Add New Maintenance Order</Text>
              <Text style={styles.headerSubtitle}>
                Create a new maintenance order for your fleet
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

        {/* Form */}
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
              {availableVehicles.length === 0 && (
                <Text style={styles.errorHint}>No vehicles available for maintenance</Text>
              )}
              <Text style={styles.inputHint}>
                The backend will validate schedule conflicts with existing maintenance orders
              </Text>
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
              <Text style={styles.inputHint}>
                Format: YYYY-MM-DD (e.g., {getTodayString()})
              </Text>
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
              <Text style={styles.inputHint}>
                Must be after start date
              </Text>
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
              <Label>Estimated Cost *</Label>
              <Input
                value={formData.cost}
                onChangeText={(value) => handleInputChange('cost', value)}
                placeholder="0.00"
                keyboardType="numeric"
                editable={!isLoading}
              />
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
              onPress={() => navigation.navigate('MaintenanceOrders')}
              variant="secondary"
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmit}
              disabled={isLoading || availableVehicles.length === 0}
              variant="primary"
              style={styles.actionButton}
            >
              {isLoading ? (
                <View style={styles.loadingContent}>
                  <LoadingSpinner size="sm" color="white" />
                  <Text style={styles.loadingText}>Creating Order...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialIcons name="add" size={16} color="white" />
                  <Text style={styles.buttonText}>Create Maintenance Order</Text>
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
  errorHint: {
    fontSize: 12,
    color: '#ef4444',
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