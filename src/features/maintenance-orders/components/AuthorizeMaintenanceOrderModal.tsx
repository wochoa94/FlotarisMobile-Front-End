import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { MaintenanceOrder } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';

interface AuthorizeMaintenanceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorize: (data: { cost: number; quotationDetails: string; comments: string }) => Promise<void>;
  order: MaintenanceOrder;
  isLoading: boolean;
}

export function AuthorizeMaintenanceOrderModal({
  isOpen,
  onClose,
  onAuthorize,
  order,
  isLoading
}: AuthorizeMaintenanceOrderModalProps) {
  const [formData, setFormData] = useState({
    cost: order.cost?.toString() || '',
    quotationDetails: order.quotationDetails || '',
    comments: order.comments || '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        cost: order.cost?.toString() || '',
        quotationDetails: order.quotationDetails || '',
        comments: order.comments || '',
      });
      setValidationError(null);
    }
  }, [isOpen, order]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.cost.trim()) {
      return 'Cost is required for authorization';
    }
    
    const costValue = Number(formData.cost);
    if (isNaN(costValue) || costValue < 0) {
      return 'Please enter a valid cost amount';
    }

    if (!formData.quotationDetails.trim()) {
      return 'Quotation details are required for authorization';
    }

    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      await onAuthorize({
        cost: Number(formData.cost),
        quotationDetails: formData.quotationDetails.trim(),
        comments: formData.comments.trim(),
      });
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={
        <View style={styles.headerContent}>
          <MaterialIcons name="check-circle" size={24} color="#10b981" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Authorize Maintenance Order</Text>
            <Text style={styles.headerSubtitle}>Order #{order.orderNumber}</Text>
          </View>
        </View>
      }
      footerContent={
        <View style={styles.footerContent}>
          <Button
            onPress={onClose}
            disabled={isLoading}
            variant="secondary"
            style={styles.footerButton}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            disabled={isLoading}
            variant="primary"
            style={[styles.footerButton, styles.authorizeButton]}
          >
            {isLoading ? (
              <View style={styles.loadingContent}>
                <LoadingSpinner size="sm" color="white" />
                <Text style={styles.loadingText}>Authorizing...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <MaterialIcons name="check-circle" size={16} color="white" />
                <Text style={styles.buttonText}>Authorize Order</Text>
              </View>
            )}
          </Button>
        </View>
      }
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Start Date:</Text>
                <Text style={styles.summaryValue}>{new Date(order.startDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Est. Completion:</Text>
                <Text style={styles.summaryValue}>{new Date(order.estimatedCompletionDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.summaryItemFull}>
                <Text style={styles.summaryLabel}>Description:</Text>
                <Text style={styles.summaryDescription}>{order.description}</Text>
              </View>
            </View>
          </View>

          {/* Validation Error */}
          {validationError && (
            <Alert
              type="error"
              message={validationError}
              onDismiss={() => setValidationError(null)}
            />
          )}

          {/* Authorization Form */}
          <View style={styles.formContainer}>
            {/* Cost */}
            <View style={styles.inputGroup}>
              <Label>Authorized Cost *</Label>
              <View style={styles.costInputWrapper}>
                <View style={styles.costIcon}>
                  <MaterialIcons name="attach-money" size={16} color="#9ca3af" />
                </View>
                <Input
                  value={formData.cost}
                  onChangeText={(value) => handleInputChange('cost', value)}
                  placeholder="0.00"
                  keyboardType="numeric"
                  editable={!isLoading}
                  style={styles.costInput}
                />
              </View>
            </View>

            {/* Quotation Details */}
            <View style={styles.inputGroup}>
              <Label>Quotation Details *</Label>
              <Input
                as="textarea"
                value={formData.quotationDetails}
                onChangeText={(value) => handleInputChange('quotationDetails', value)}
                placeholder="Detailed breakdown of authorized costs, parts, labor, etc..."
                rows={4}
                editable={!isLoading}
              />
            </View>

            {/* Comments */}
            <View style={styles.inputGroup}>
              <Label>Authorization Comments</Label>
              <Input
                as="textarea"
                value={formData.comments}
                onChangeText={(value) => handleInputChange('comments', value)}
                placeholder="Additional authorization notes or special instructions..."
                rows={3}
                editable={!isLoading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  orderSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  summaryGrid: {
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItemFull: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  summaryDescription: {
    fontSize: 14,
    color: '#111827',
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  costInputWrapper: {
    position: 'relative',
  },
  costIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  costInput: {
    paddingLeft: 40,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  authorizeButton: {
    backgroundColor: '#10b981',
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