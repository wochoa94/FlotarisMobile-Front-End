import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { useFleetData } from '../../../hooks/useFleetData';
import { driverService } from '../../../services/apiService';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';

interface DriverFormData {
  name: string;
  email: string;
  age: string;
  address: string;
  idNumber: string;
}

export function AddDriverPage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { refreshData } = useFleetData();
  
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    email: '',
    age: '',
    address: '',
    idNumber: '',
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateIdNumber = (idNumber: string): boolean => {
    // Basic validation: should be alphanumeric and between 6-20 characters
    const idRegex = /^[A-Za-z0-9]{6,20}$/;
    return idRegex.test(idNumber);
  };

  const validateForm = (): string | null => {
    // Required field validation
    if (!formData.name.trim()) return 'Driver name is required';
    if (!formData.email.trim()) return 'Email address is required';
    if (!formData.age.trim()) return 'Age is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.idNumber.trim()) return 'ID number is required';
    
    // Email format validation
    if (!validateEmail(formData.email.trim())) {
      return 'Please enter a valid email address';
    }
    
    // Age validation
    const ageValue = Number(formData.age);
    if (isNaN(ageValue) || ageValue < 18 || ageValue > 100) {
      return 'Age must be between 18 and 100 years';
    }
    
    // ID number validation
    if (!validateIdNumber(formData.idNumber.trim())) {
      return 'ID number must be 6-20 alphanumeric characters';
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
      // Check email uniqueness
      const isEmailUnique = await driverService.checkEmailUniqueness(formData.email);
      if (!isEmailUnique) {
        setErrorMessage('A driver with this email address already exists');
        setIsLoading(false);
        return;
      }

      // Prepare driver data
      const driverData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        age: Number(formData.age),
        address: formData.address.trim(),
        idNumber: formData.idNumber.trim().toUpperCase(),
        userId: null, // No linked user account
      };

      // Add driver via API service
      await driverService.addDriver(driverData);

      // Success feedback
      setSuccessMessage(`Driver "${driverData.name}" added successfully!`);
      
      // Refresh fleet data
      await refreshData();
      
      // Redirect to drivers page after a short delay
      setTimeout(() => {
        navigation.navigate('Drivers');
      }, 1500);

    } catch (error) {
      console.error('Error adding driver:', error);
      setErrorMessage(
        error instanceof Error 
          ? `Failed to add driver: ${error.message}`
          : 'Failed to add driver. Please try again.'
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

  // Only allow admin users to access this page
  if (!user?.isAdmin) {
    return (
      <View style={styles.accessDeniedContainer}>
        <Text style={styles.accessDeniedText}>Access denied. Admin privileges required.</Text>
        <Button onPress={() => navigation.navigate('Drivers')} variant="primary">
          Back to Drivers
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
              <Text style={styles.headerTitle}>Add New Driver</Text>
              <Text style={styles.headerSubtitle}>
                Create a new driver profile for your fleet
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
            {/* Driver Name */}
            <View style={styles.inputGroup}>
              <Label>Full Name *</Label>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <MaterialCommunityIcons name="account" size={16} color="#9ca3af" />
                </View>
                <Input
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter driver's full name"
                  style={styles.inputWithIcon}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Label>Email Address *</Label>
              <Input
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="driver@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.inputHint}>
                Must be unique across the system
              </Text>
            </View>

            {/* Age */}
            <View style={styles.inputGroup}>
              <Label>Age *</Label>
              <Input
                value={formData.age}
                onChangeText={(value) => handleInputChange('age', value)}
                placeholder="25"
                keyboardType="numeric"
              />
              <Text style={styles.inputHint}>
                Must be between 18 and 100 years
              </Text>
            </View>

            {/* ID Number */}
            <View style={styles.inputGroup}>
              <Label>ID Number *</Label>
              <Input
                value={formData.idNumber}
                onChangeText={(value) => handleInputChange('idNumber', value)}
                placeholder="ABC123456"
                maxLength={20}
                autoCapitalize="characters"
              />
              <Text style={styles.inputHint}>
                6-20 alphanumeric characters (license number, employee ID, etc.)
              </Text>
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Label>Address *</Label>
              <Input
                as="textarea"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Enter complete address including city, state, and postal code"
                rows={3}
              />
            </View>
          </View>

          {/* Information Notice */}
          <View style={styles.infoNotice}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="info" size={20} color="#3b82f6" />
              <Text style={styles.infoTitle}>Driver Profile Information</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoItem}>• This creates a driver profile only (no user account)</Text>
              <Text style={styles.infoItem}>• The driver will not have system login access</Text>
              <Text style={styles.infoItem}>• Email must be unique across all drivers</Text>
              <Text style={styles.infoItem}>• All fields marked with * are required</Text>
            </View>
          </View>

          {/* Form Actions */}
          <View style={styles.formActions}>
            <Button
              onPress={() => navigation.navigate('Drivers')}
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
                  <Text style={styles.loadingText}>Adding Driver...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialIcons name="add" size={16} color="white" />
                  <Text style={styles.buttonText}>Add Driver</Text>
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
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  accessDeniedText: {
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
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 40,
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoNotice: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 6,
    padding: 16,
    marginTop: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e40af',
    marginLeft: 12,
  },
  infoContent: {
    gap: 4,
  },
  infoItem: {
    fontSize: 14,
    color: '#1e40af',
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