import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { addDaysToDate, formatGanttDate } from '../../../utils/dateUtils';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

interface DateNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStartDate: Date;
  daysToShow: number;
  onStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDaysToShowChange: (newDaysToShow: number) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onGoToToday: () => void;
}

export function DateNavigationModal({
  isOpen,
  onClose,
  currentStartDate,
  daysToShow,
  onStartDateChange,
  onDaysToShowChange,
  onPreviousWeek,
  onNextWeek,
  onGoToToday,
}: DateNavigationModalProps) {
  if (!isOpen) return null;

  // Handle date input change for React Native
  const handleDateChange = (value: string) => {
    // Create a synthetic event object to match the web interface
    const syntheticEvent = {
      target: { value }
    } as React.ChangeEvent<HTMLInputElement>;
    onStartDateChange(syntheticEvent);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerContent={
        <View style={styles.headerContent}>
          <MaterialIcons name="event" size={20} color="#6b7280" />
          <Text style={styles.headerTitle}>Date Navigation</Text>
        </View>
      }
      footerContent={
        <Button
          onPress={onClose}
          variant="primary"
        >
          Apply Changes
        </Button>
      }
    >
      <View style={styles.content}>
        {/* Date Navigation Content */}
        <View style={styles.navigationGrid}>
          {/* Date Selection */}
          <View style={styles.dateSection}>
            <Label>Start Date</Label>
            <Input
              value={format(currentStartDate, 'yyyy-MM-dd')}
              onChangeText={handleDateChange}
              placeholder="YYYY-MM-DD"
            />
            <Text style={styles.inputHint}>Format: YYYY-MM-DD</Text>
          </View>

          {/* Days to Show Selection */}
          <View style={styles.durationSection}>
            <Label>View Duration</Label>
            <View style={styles.durationButtons}>
              {[
                { value: 7, label: '1 Week' },
                { value: 14, label: '2 Weeks' },
                { value: 30, label: '1 Month' }
              ].map((option) => (
                <Button
                  key={option.value}
                  onPress={() => onDaysToShowChange(option.value)}
                  variant={daysToShow === option.value ? 'primary' : 'secondary'}
                  style={[
                    styles.durationButton,
                    daysToShow === option.value ? styles.selectedDurationButton : styles.unselectedDurationButton
                  ]}
                >
                  {option.label}
                </Button>
              ))}
            </View>
          </View>

          {/* Navigation Controls */}
          <View style={styles.navigationSection}>
            <Label>Quick Navigation</Label>
            <View style={styles.navigationControls}>
              <Button
                onPress={onPreviousWeek}
                variant="secondary"
                style={styles.navButton}
              >
                <View style={styles.navButtonContent}>
                  <MaterialIcons name="chevron-left" size={16} color="#6b7280" />
                </View>
              </Button>
              
              <Button
                onPress={onGoToToday}
                variant="secondary"
                style={[styles.navButton, styles.todayButton]}
              >
                Today
              </Button>
              
              <Button
                onPress={onNextWeek}
                variant="secondary"
                style={styles.navButton}
              >
                <View style={styles.navButtonContent}>
                  <MaterialIcons name="chevron-right" size={16} color="#6b7280" />
                </View>
              </Button>
            </View>
          </View>
        </View>

        {/* Current Range Display */}
        <View style={styles.currentRange}>
          <Text style={styles.currentRangeLabel}>
            <Text style={styles.currentRangeBold}>Current Range:</Text> {formatGanttDate(currentStartDate)} - {formatGanttDate(addDaysToDate(currentStartDate, daysToShow - 1))}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  content: {
    gap: 24,
  },
  navigationGrid: {
    gap: 24,
  },
  dateSection: {
    gap: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
  },
  durationSection: {
    gap: 8,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedDurationButton: {
    backgroundColor: '#2563eb',
  },
  unselectedDurationButton: {
    backgroundColor: '#f3f4f6',
  },
  navigationSection: {
    gap: 8,
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 40,
  },
  navButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  currentRange: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  currentRangeLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  currentRangeBold: {
    fontWeight: '500',
  },
});