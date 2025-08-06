import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { useFleetData } from '../../../hooks/useFleetData';
import { vehicleScheduleService } from '../../../services/apiService';
import { getTodayString, getDaysBetweenDates, parseDate, parseDateEnd } from '../../../utils/dateUtils';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';

interface VehicleScheduleFormData {
  vehicleId: string;
  startDate: string;
  endDate: string;
  driverId: string;
  notes: string;
}

export function AddVehicleSchedulePage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data, refreshData } = useFleetData();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<VehicleScheduleFormData>({
    vehicleId: '',
    startDate: '',
    endDate: '',
    driverId: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stepErrors, setStepErrors] = useState<{ [key: number]: string }>({});

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
    
    // Clear step error when user makes changes
    if (stepErrors[currentStep]) {
      setStepErrors(prev => ({
        ...prev,
        [currentStep]: '',
      }));
    }
  };

  // Basic validation for each step (no overlap checks - handled by backend)
  const validateCurrentStep = (): boolean => {
    let error: string | null = null;
    
    switch (currentStep) {
      case 1:
        // Step 1: Vehicle Selection
        if (!formData.vehicleId) {
          error = 'Vehicle selection is required';
        } else {
          const vehicle = data.vehicles.find(v => v.id === formData.vehicleId);
          if (!vehicle) {
            error = 'Selected vehicle not found';
          }
        }
        break;
        
      case 2:
        // Step 2: Date Range
        if (!formData.startDate) {
          error = 'Start date is required';
        } else if (!formData.endDate) {
          error = 'End date is required';
        } else {
          const startDate = new Date(formData.startDate);
          const endDate = new Date(formData.endDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (startDate < today) {
            error = 'Start date cannot be in the past';
          } else if (endDate <= startDate) {
            error = 'End date must be after start date';
          }
        }
        break;
        
      case 3:
        // Step 3: Driver Selection
        if (!formData.driverId) {
          error = 'Driver selection is required';
        } else {
          const driver = data.drivers.find(d => d.id === formData.driverId);
          if (!driver) {
            error = 'Selected driver not found';
          }
        }
        break;
    }
    
    if (error) {
      setStepErrors(prev => ({
        ...prev,
        [currentStep]: error,
      }));
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');
    
    // Basic validation only - overlap checks handled by backend
    if (!validateCurrentStep()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare vehicle schedule data
      const scheduleData = {
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes.trim() || null,
        status: 'scheduled' as const,
        userId: user?.id || '',
      };

      // Add vehicle schedule via API service - backend will handle overlap validation
      await vehicleScheduleService.addVehicleSchedule(scheduleData);

      // Success feedback
      setSuccessMessage('Vehicle schedule created successfully!');
      
      // Refresh fleet data
      await refreshData();
      
      // Redirect to vehicle schedules page after a short delay
      setTimeout(() => {
        navigation.navigate('VehicleSchedules');
      }, 1500);

    } catch (error) {
      console.error('Error creating vehicle schedule:', error);
      
      // Handle specific backend validation errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to create vehicle schedule. Please try again.';
      
      // Check for overlap-related errors from backend
      if (errorMessage.includes('unavailable') || errorMessage.includes('conflict') || errorMessage.includes('overlap')) {
        setErrorMessage(`Schedule conflict: ${errorMessage}`);
      } else {
        setErrorMessage(`Failed to create vehicle schedule: ${errorMessage}`);
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

  // Show all vehicles in the fleet, including those in maintenance
  const availableVehicles = data.vehicles;
  
  // Get selected vehicle details
  const selectedVehicle = formData.vehicleId ? data.vehicles.find(v => v.id === formData.vehicleId) : null;
  
  // Get selected driver details
  const selectedDriver = formData.driverId ? data.drivers.find(d => d.id === formData.driverId) : null;

  // Step configuration - simplified unlocked logic
  const steps = [
    { 
      number: 1, 
      title: 'Vehicle Selection', 
      icon: 'truck', 
      unlocked: true 
    },
    { 
      number: 2, 
      title: 'Date Range', 
      icon: 'event', 
      unlocked: currentStep >= 2 || !!formData.vehicleId 
    },
    { 
      number: 3, 
      title: 'Driver & Notes', 
      icon: 'person', 
      unlocked: currentStep >= 3 || (!!formData.vehicleId && !!formData.startDate && !!formData.endDate) 
    },
  ];

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
              onPress={() => navigation.navigate('VehicleSchedules')}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <View style={styles.backButtonContent}>
                <MaterialIcons name="arrow-back" size={16} color="#6b7280" />
                <Text style={styles.backButtonText}>Back to Vehicle Schedules</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Create Vehicle Schedule</Text>
              <Text style={styles.headerSubtitle}>
                Schedule a vehicle assignment for your fleet
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

        {/* Step Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressContent}>
            <View style={styles.stepIndicators}>
              {steps.map((step, stepIdx) => {
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                const isUnlocked = step.unlocked;
                
                return (
                  <View key={step.number} style={styles.stepContainer}>
                    <View style={styles.stepIndicator}>
                      <View style={[
                        styles.stepCircle,
                        isCompleted ? styles.stepCompleted : 
                        isActive ? styles.stepActive : 
                        isUnlocked ? styles.stepUnlocked : styles.stepLocked
                      ]}>
                        <MaterialCommunityIcons
                          name={step.icon as any}
                          size={20}
                          color={
                            isCompleted ? 'white' : 
                            isActive ? '#2563eb' : 
                            isUnlocked ? '#6b7280' : '#d1d5db'
                          }
                        />
                      </View>
                      <Text style={[
                        styles.stepTitle,
                        isActive ? styles.stepTitleActive : 
                        isCompleted ? styles.stepTitleCompleted : 
                        isUnlocked ? styles.stepTitleUnlocked : styles.stepTitleLocked
                      ]}>
                        {step.title}
                      </Text>
                    </View>
                    {stepIdx !== steps.length - 1 && (
                      <View style={[
                        styles.stepConnector,
                        isCompleted && styles.stepConnectorCompleted
                      ]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Step Error Message */}
        {stepErrors[currentStep] && (
          <Alert
            type="error"
            message={stepErrors[currentStep]}
            onDismiss={() => setStepErrors(prev => ({ ...prev, [currentStep]: '' }))}
          />
        )}

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.formContent}>
            {/* Step 1: Vehicle Selection */}
            {currentStep === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepHeader}>Step 1: Select Vehicle</Text>
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
                        label={`${vehicle.name} - ${vehicle.make} ${vehicle.model} ${vehicle.year} (${vehicle.status})`}
                        value={vehicle.id}
                      />
                    ))}
                  </Input>
                  {availableVehicles.length === 0 && (
                    <Text style={styles.errorHint}>No vehicles available for scheduling</Text>
                  )}
                </View>
                
                {selectedVehicle && (
                  <View style={styles.selectedVehicleInfo}>
                    <Text style={styles.selectedVehicleTitle}>Selected Vehicle Details</Text>
                    <View style={styles.selectedVehicleGrid}>
                      <View style={styles.selectedVehicleItem}>
                        <Text style={styles.selectedVehicleLabel}>Name:</Text>
                        <Text style={styles.selectedVehicleValue}>{selectedVehicle.name}</Text>
                      </View>
                      <View style={styles.selectedVehicleItem}>
                        <Text style={styles.selectedVehicleLabel}>Status:</Text>
                        <Text style={[
                          styles.selectedVehicleValue,
                          selectedVehicle.status === 'maintenance' && styles.maintenanceWarning
                        ]}>
                          {selectedVehicle.status}
                        </Text>
                      </View>
                      <View style={styles.selectedVehicleItem}>
                        <Text style={styles.selectedVehicleLabel}>Make/Model:</Text>
                        <Text style={styles.selectedVehicleValue}>{selectedVehicle.make} {selectedVehicle.model}</Text>
                      </View>
                      <View style={styles.selectedVehicleItem}>
                        <Text style={styles.selectedVehicleLabel}>Year:</Text>
                        <Text style={styles.selectedVehicleValue}>{selectedVehicle.year}</Text>
                      </View>
                    </View>
                    {selectedVehicle.status === 'maintenance' && (
                      <View style={styles.maintenanceNotice}>
                        <Text style={styles.maintenanceNoticeText}>
                          <Text style={styles.maintenanceNoticeBold}>Note:</Text> This vehicle is currently undergoing maintenance. 
                          The backend will validate schedule conflicts with maintenance periods.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Step 2: Date Range Selection */}
            {currentStep === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepHeader}>Step 2: Select Date Range</Text>
                <View style={styles.dateRangeGrid}>
                  <View style={styles.inputGroup}>
                    <Label>Start Date *</Label>
                    <Input
                      value={formData.startDate}
                      onChangeText={(value) => handleInputChange('startDate', value)}
                      placeholder="YYYY-MM-DD"
                      editable={!isLoading}
                    />
                    <Text style={styles.inputHint}>
                      Format: YYYY-MM-DD (minimum: {getTodayString()})
                    </Text>
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Label>End Date *</Label>
                    <Input
                      value={formData.endDate}
                      onChangeText={(value) => handleInputChange('endDate', value)}
                      placeholder="YYYY-MM-DD"
                      editable={!isLoading}
                    />
                    <Text style={styles.inputHint}>
                      Must be after start date
                    </Text>
                  </View>
                </View>
                
                {formData.startDate && formData.endDate && (
                  <View style={styles.durationInfo}>
                    <Text style={styles.durationTitle}>Schedule Duration</Text>
                    <Text style={styles.durationValue}>
                      {(() => {
                        const startDateObj = parseDate(formData.startDate);
                        const endDateObj = parseDateEnd(formData.endDate);
                        const diffDays = getDaysBetweenDates(startDateObj, endDateObj);
                        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                      })()}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Step 3: Driver Selection and Notes */}
            {currentStep === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepHeader}>Step 3: Select Driver & Add Notes</Text>
                
                {/* Driver Selection */}
                <View style={styles.inputGroup}>
                  <Label>Driver *</Label>
                  <Input
                    as="select"
                    selectedValue={formData.driverId}
                    onValueChange={(value) => handleInputChange('driverId', value)}
                    enabled={!isLoading}
                  >
                    <Input.Item label="Select a driver" value="" />
                    {data.drivers.map((driver) => (
                      <Input.Item 
                        key={driver.id} 
                        label={`${driver.name} - ${driver.email}`}
                        value={driver.id}
                      />
                    ))}
                  </Input>
                </View>
                
                {selectedDriver && (
                  <View style={styles.selectedDriverInfo}>
                    <Text style={styles.selectedDriverTitle}>Selected Driver Details</Text>
                    <View style={styles.selectedDriverGrid}>
                      <View style={styles.selectedDriverItem}>
                        <Text style={styles.selectedDriverLabel}>Name:</Text>
                        <Text style={styles.selectedDriverValue}>{selectedDriver.name}</Text>
                      </View>
                      <View style={styles.selectedDriverItem}>
                        <Text style={styles.selectedDriverLabel}>Email:</Text>
                        <Text style={styles.selectedDriverValue}>{selectedDriver.email}</Text>
                      </View>
                      <View style={styles.selectedDriverItem}>
                        <Text style={styles.selectedDriverLabel}>ID Number:</Text>
                        <Text style={styles.selectedDriverValue}>{selectedDriver.idNumber}</Text>
                      </View>
                      <View style={styles.selectedDriverItem}>
                        <Text style={styles.selectedDriverLabel}>Age:</Text>
                        <Text style={styles.selectedDriverValue}>{selectedDriver.age || 'N/A'}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Schedule Summary */}
                <View style={styles.scheduleSummary}>
                  <Text style={styles.scheduleSummaryTitle}>Schedule Summary</Text>
                  <View style={styles.scheduleSummaryGrid}>
                    <View style={styles.scheduleSummaryItem}>
                      <Text style={styles.scheduleSummaryLabel}>Vehicle:</Text>
                      <Text style={styles.scheduleSummaryValue}>{selectedVehicle?.name || 'Not selected'}</Text>
                    </View>
                    <View style={styles.scheduleSummaryItem}>
                      <Text style={styles.scheduleSummaryLabel}>Driver:</Text>
                      <Text style={styles.scheduleSummaryValue}>{selectedDriver?.name || 'Not selected'}</Text>
                    </View>
                    <View style={styles.scheduleSummaryItem}>
                      <Text style={styles.scheduleSummaryLabel}>Start Date:</Text>
                      <Text style={styles.scheduleSummaryValue}>
                        {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Not selected'}
                      </Text>
                    </View>
                    <View style={styles.scheduleSummaryItem}>
                      <Text style={styles.scheduleSummaryLabel}>End Date:</Text>
                      <Text style={styles.scheduleSummaryValue}>
                        {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'Not selected'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Notes */}
                <View style={styles.inputGroup}>
                  <Label>Notes (Optional)</Label>
                  <Input
                    as="textarea"
                    value={formData.notes}
                    onChangeText={(value) => handleInputChange('notes', value)}
                    placeholder="Add any additional notes or special instructions for this schedule..."
                    rows={4}
                    editable={!isLoading}
                  />
                  <Text style={styles.inputHint}>
                    Add any special instructions or notes for this schedule
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Form Actions */}
          <View style={styles.formActions}>
            <View style={styles.formActionsLeft}>
              {currentStep > 1 && (
                <Button
                  onPress={handleBack}
                  disabled={isLoading}
                  variant="secondary"
                >
                  <View style={styles.buttonContent}>
                    <MaterialIcons name="chevron-left" size={16} color="#6b7280" />
                    <Text style={styles.backButtonActionText}>Back</Text>
                  </View>
                </Button>
              )}
            </View>
            
            <View style={styles.formActionsRight}>
              <Button
                onPress={() => navigation.navigate('VehicleSchedules')}
                variant="secondary"
                style={styles.actionButton}
              >
                Cancel
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  onPress={handleNext}
                  disabled={isLoading || !steps[currentStep - 1]?.unlocked}
                  variant="primary"
                  style={styles.actionButton}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.nextButtonText}>Next</Text>
                    <MaterialIcons name="chevron-right" size={16} color="white" />
                  </View>
                </Button>
              ) : (
                <Button
                  onPress={handleSubmit}
                  disabled={isLoading || availableVehicles.length === 0}
                  variant="primary"
                  style={[styles.actionButton, styles.createButton]}
                >
                  {isLoading ? (
                    <View style={styles.buttonContent}>
                      <LoadingSpinner size="sm" color="white" />
                      <Text style={styles.loadingText}>Creating Schedule...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <MaterialIcons name="add" size={16} color="white" />
                      <Text style={styles.createButtonText}>Create Schedule</Text>
                    </View>
                  )}
                </Button>
              )}
            </View>
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
  progressContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  progressContent: {
    gap: 16,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepIndicator: {
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  stepActive: {
    backgroundColor: 'white',
    borderColor: '#2563eb',
  },
  stepUnlocked: {
    backgroundColor: 'white',
    borderColor: '#d1d5db',
  },
  stepLocked: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepTitleActive: {
    color: '#2563eb',
  },
  stepTitleCompleted: {
    color: '#111827',
  },
  stepTitleUnlocked: {
    color: '#6b7280',
  },
  stepTitleLocked: {
    color: '#d1d5db',
  },
  stepConnector: {
    position: 'absolute',
    top: 20,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#e5e7eb',
    zIndex: -1,
  },
  stepConnectorCompleted: {
    backgroundColor: '#2563eb',
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
  stepContent: {
    gap: 24,
  },
  stepHeader: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
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
  selectedVehicleInfo: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    padding: 16,
  },
  selectedVehicleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e40af',
    marginBottom: 8,
  },
  selectedVehicleGrid: {
    gap: 8,
  },
  selectedVehicleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedVehicleLabel: {
    fontSize: 14,
    color: '#1e40af',
  },
  selectedVehicleValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textTransform: 'capitalize',
  },
  maintenanceWarning: {
    color: '#d97706',
  },
  maintenanceNotice: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
  },
  maintenanceNoticeText: {
    fontSize: 14,
    color: '#92400e',
  },
  maintenanceNoticeBold: {
    fontWeight: 'bold',
  },
  dateRangeGrid: {
    gap: 16,
  },
  durationInfo: {
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    padding: 16,
  },
  durationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#166534',
    marginBottom: 4,
  },
  durationValue: {
    fontSize: 14,
    color: '#166534',
  },
  selectedDriverInfo: {
    backgroundColor: '#faf5ff',
    borderRadius: 6,
    padding: 16,
  },
  selectedDriverTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7c3aed',
    marginBottom: 8,
  },
  selectedDriverGrid: {
    gap: 8,
  },
  selectedDriverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedDriverLabel: {
    fontSize: 14,
    color: '#7c3aed',
  },
  selectedDriverValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  scheduleSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 16,
  },
  scheduleSummaryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  scheduleSummaryGrid: {
    gap: 8,
  },
  scheduleSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleSummaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  scheduleSummaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  formActionsLeft: {
    flex: 1,
  },
  formActionsRight: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    minWidth: 80,
  },
  createButton: {
    backgroundColor: '#10b981',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonActionText: {
    color: '#6b7280',
    marginLeft: 4,
  },
  nextButtonText: {
    color: 'white',
    marginRight: 4,
  },
  loadingText: {
    color: 'white',
    marginLeft: 8,
  },
  createButtonText: {
    color: 'white',
    marginLeft: 8,
  },
});