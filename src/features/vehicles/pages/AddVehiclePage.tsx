import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { useFleetData } from '../../../hooks/useFleetData';
import { vehicleService } from '../../../services/apiService';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';

interface VehicleFormData {
  name: string;
  vin: string;
  licensePlate: string;
  make: string;
  model: string;
  year: string;
  fuelType: string;
  mileage: string;
  lastMaintenance: string;
  maintenanceCost: string;
}

export function AddVehiclePage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { refreshData } = useFleetData();
  
  const [formData, setFormData] = useState<VehicleFormData>({
    name: '',
    vin: '',
    licensePlate: '',
    make: '',
    model: '',
    year: '',
    fuelType: '',
    mileage: '',
    lastMaintenance: '',
    maintenanceCost: '',
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
    if (!formData.maintenanceCost.trim()) return 'Initial maintenance cost is required';
    
    // VIN validation (basic format check)
    if (formData.vin && formData.vin.length < 17) return 'VIN must be at least 17 characters';
    
    // Year validation
    if (formData.year && (isNaN(Number(formData.year)) || Number(formData.year) < 1900 || Number(formData.year) > new Date().getFullYear() + 1)) {
      return 'Please enter a valid year';
    }
    
    // Mileage validation
    if (formData.mileage && (isNaN(Number(formData.mileage)) || Number(formData.mileage) < 0)) {
      return 'Please enter a valid mileage';
    }
    
    // Maintenance cost validation
    if (isNaN(Number(formData.maintenanceCost)) || Number(formData.maintenanceCost) < 0) {
      return 'Please enter a valid maintenance cost';
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
      // Prepare vehicle data
      const vehicleData = {
        name: formData.name.trim(),
        vin: formData.vin.trim().toUpperCase() || null,
        licensePlate: formData.licensePlate.trim(),
        make: formData.make.trim() || null,
        model: formData.model.trim() || null,
        year: formData.year ? Number(formData.year) : null,
        fuelType: formData.fuelType.trim() || null,
        mileage: formData.mileage ? Number(formData.mileage) : 0,
        lastMaintenance: formData.lastMaintenance,
        nextMaintenance: null,
        maintenanceCost: Number(formData.maintenanceCost),
        status: 'idle' as const, // Auto-assign idle status
        assignedDriverId: null,
        userId: user?.id,
      };

      // Add vehicle via API service
      await vehicleService.addVehicle(vehicleData);

      // Success feedback
      setSuccessMessage('Vehicle added successfully!');
      
      // Refresh fleet data
      await refreshData();
      
      // Redirect to vehicles page after a short delay
      setTimeout(() => {
        navigation.navigate('Vehicles');
      }, 1500);

    } catch (error) {
      console.error('Error adding vehicle:', error);
      setErrorMessage(
        error instanceof Error 
          ? `Failed to add vehicle: ${error.message}`
          : 'Failed to add vehicle. Please try again.'
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
              <Text style={styles.headerTitle}>Add New Vehicle</Text>
              <Text style={styles.headerSubtitle}>
                Add a new vehicle to your fleet
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

            {/* VIN */}
            <View style={styles.inputGroup}>
              <Label>VIN (Vehicle Identification Number)</Label>
              <Input
                value={formData.vin}
                onChangeText={(value) => handleInputChange('vin', value)}
                placeholder="17-character VIN (optional)"
                maxLength={17}
                autoCapitalize="characters"
              />
            </View>

            {/* Make */}
            <View style={styles.inputGroup}>
              <Label>Make</Label>
              <Input
                value={formData.make}
                onChangeText={(value) => handleInputChange('make', value)}
                placeholder="e.g., Toyota, Ford, Honda"
              />
            </View>

            {/* Model */}
            <View style={styles.inputGroup}>
              <Label>Model</Label>
              <Input
                value={formData.model}
                onChangeText={(value) => handleInputChange('model', value)}
                placeholder="e.g., Camry, F-150, Civic"
              />
            </View>

            {/* Year */}
            <View style={styles.inputGroup}>
              <Label>Year</Label>
              <Input
                value={formData.year}
                onChangeText={(value) => handleInputChange('year', value)}
                placeholder="e.g., 2023"
                keyboardType="numeric"
              />
            </View>

            {/* Fuel Type */}
            <View style={styles.inputGroup}>
              <Label>Fuel Type</Label>
              <Input
                value={formData.fuelType}
                onChangeText={(value) => handleInputChange('fuelType', value)}
                placeholder="e.g., Gasoline, Diesel, Electric, Hybrid"
              />
            </View>

            {/* Mileage */}
            <View style={styles.inputGroup}>
              <Label>Current Mileage</Label>
              <Input
                value={formData.mileage}
                onChangeText={(value) => handleInputChange('mileage', value)}
                placeholder="Enter current mileage"
                keyboardType="numeric"
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

            {/* Initial Maintenance Cost */}
            <View style={styles.inputGroup}>
              <Label>Initial Maintenance Cost *</Label>
              <Input
                value={formData.maintenanceCost}
                onChangeText={(value) => handleInputChange('maintenanceCost', value)}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Form Actions */}
          <View style={styles.formActions}>
            <Button
              onPress={() => navigation.navigate('Vehicles')}
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
                  <Text style={styles.loadingText}>Adding Vehicle...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialIcons name="add" size={16} color="white" />
                  <Text style={styles.buttonText}>Add Vehicle</Text>
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