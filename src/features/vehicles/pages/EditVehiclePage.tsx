import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { useFleetData } from '../../../hooks/useFleetData';
import { vehicleService } from '../../../services/apiService';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';

interface EditVehicleFormData {
  name: string;
  licensePlate: string;
  lastMaintenance: string;
}

export function EditVehiclePage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const { user } = useAuth();
  const { data, loading, error, refreshData } = useFleetData();
  
  const [formData, setFormData] = useState<EditVehicleFormData>({
    name: '',
    licensePlate: '',
    lastMaintenance: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const vehicle = data.vehicles.find(v => v.id === id);

  // Initialize form data when vehicle is loaded
  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        licensePlate: vehicle.licensePlate || '',
        lastMaintenance: vehicle.lastMaintenance || '',
      });
    }
  }, [vehicle]);

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

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Vehicle name is required';
    if (!formData.licensePlate.trim()) return 'License plate is required';
    if (!formData.lastMaintenance) return 'Last maintenance date is required';
    return null;
  };

  const handleSubmit = async () => {
    if (!vehicle) return;
    
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
      // Prepare update data
      const updateData = {
        name: formData.name.trim(),
        licensePlate: formData.licensePlate.trim(),
        lastMaintenance: formData.lastMaintenance,
      };

      // Update via API service
      await vehicleService.updateVehicle(vehicle.id, updateData);

      // Success feedback
      setSuccessMessage('Vehicle updated successfully!');
      
      // Refresh fleet data
      await refreshData();
      
      // Redirect to vehicle detail page after a short delay
      setTimeout(() => {
        navigation.navigate('VehicleDetail', { id: vehicle.id });
      }, 1500);

    } catch (error) {
      console.error('Error updating vehicle:', error);
      setErrorMessage(
        error instanceof Error 
          ? `Failed to update vehicle: ${error.message}`
          : 'Failed to update vehicle. Please try again.'
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.navigate('VehicleDetail', { id: vehicle.id })}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <View style={styles.backButtonContent}>
                <MaterialIcons name="arrow-back" size={16} color="#6b7280" />
                <Text style={styles.backButtonText}>Back to Vehicle Details</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Edit Vehicle</Text>
              <Text style={styles.headerSubtitle}>
                Update vehicle information
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

        {/* Current Vehicle Info */}
        <View style={styles.currentVehicleInfo}>
          <Text style={styles.currentVehicleTitle}>Current Vehicle Information</Text>
          <View style={styles.currentVehicleGrid}>
            <View style={styles.currentVehicleItem}>
              <Text style={styles.currentVehicleLabel}>Make/Model:</Text>
              <Text style={styles.currentVehicleValue}>{vehicle.make} {vehicle.model} {vehicle.year}</Text>
            </View>
            <View style={styles.currentVehicleItem}>
              <Text style={styles.currentVehicleLabel}>VIN:</Text>
              <Text style={[styles.currentVehicleValue, styles.monoText]}>{vehicle.vin || 'N/A'}</Text>
            </View>
            <View style={styles.currentVehicleItem}>
              <Text style={styles.currentVehicleLabel}>Status:</Text>
              <Text style={[styles.currentVehicleValue, styles.capitalizeText]}>{vehicle.status}</Text>
            </View>
          </View>
        </View>

        {/* Edit Form */}
        <View style={styles.formContainer}>
          <View style={styles.formContent}>
            {/* Vehicle Name */}
            <View style={styles.inputGroup}>
              <Label>Vehicle Name *</Label>
              <Input
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter vehicle name"
              />
            </View>

            {/* License Plate */}
            <View style={styles.inputGroup}>
              <Label>License Plate *</Label>
              <Input
                value={formData.licensePlate}
                onChangeText={(value) => handleInputChange('licensePlate', value)}
                placeholder="Enter license plate"
              />
            </View>

            {/* Last Maintenance */}
            <View style={styles.inputGroup}>
              <Label>Last Maintenance Date *</Label>
              <Input
                value={formData.lastMaintenance}
                onChangeText={(value) => handleInputChange('lastMaintenance', value)}
                placeholder="YYYY-MM-DD"
              />
              <Text style={styles.inputHint}>
                Format: YYYY-MM-DD (e.g., 2024-01-15)
              </Text>
            </View>
          </View>

          {/* Read-only Information */}
          <View style={styles.readOnlySection}>
            <Text style={styles.readOnlyTitle}>Read-only Information</Text>
            <View style={styles.readOnlyGrid}>
              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Make</Text>
                <Text style={styles.readOnlyValue}>{vehicle.make || 'N/A'}</Text>
              </View>
              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Model</Text>
                <Text style={styles.readOnlyValue}>{vehicle.model || 'N/A'}</Text>
              </View>
              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Year</Text>
                <Text style={styles.readOnlyValue}>{vehicle.year || 'N/A'}</Text>
              </View>
              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>VIN</Text>
                <Text style={[styles.readOnlyValue, styles.monoText]}>{vehicle.vin || 'N/A'}</Text>
              </View>
              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Status</Text>
                <Text style={[styles.readOnlyValue, styles.capitalizeText]}>{vehicle.status}</Text>
              </View>
              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Mileage</Text>
                <Text style={styles.readOnlyValue}>{vehicle.mileage?.toLocaleString() || 'N/A'} miles</Text>
              </View>
            </View>
          </View>

          {/* Form Actions */}
          <View style={styles.formActions}>
            <Button
              onPress={() => navigation.navigate('VehicleDetail', { id: vehicle.id })}
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
                  <Text style={styles.loadingText}>Updating Vehicle...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialIcons name="save" size={16} color="white" />
                  <Text style={styles.buttonText}>Update Vehicle</Text>
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
  currentVehicleInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  currentVehicleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  currentVehicleGrid: {
    gap: 16,
  },
  currentVehicleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentVehicleLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  currentVehicleValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  capitalizeText: {
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
  readOnlySection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  readOnlyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  readOnlyGrid: {
    gap: 16,
  },
  readOnlyItem: {
    gap: 4,
  },
  readOnlyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  readOnlyValue: {
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