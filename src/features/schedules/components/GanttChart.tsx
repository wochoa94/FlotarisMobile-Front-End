import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { GanttItem, GanttVehicle } from '../../../types';
import { 
  addDaysToDate, 
  getDaysBetweenDates, 
  formatGanttDate, 
  formatTooltipDate, 
  isToday,
  parseDate,
  parseDateEnd
} from '../../../utils/dateUtils';

interface GanttChartProps {
  vehicles: GanttVehicle[];
  items: GanttItem[];
  startDate: Date;
  daysToShow: number;
}

interface TooltipData {
  item: GanttItem;
  visible: boolean;
}

const DAY_WIDTH_PX = 120;
const VEHICLE_COLUMN_WIDTH = 280;
const ROW_HEIGHT = 60;
const ITEM_HEIGHT = 24;
const ITEM_MARGIN = 4;

export function GanttChart({ 
  vehicles, 
  items, 
  startDate, 
  daysToShow 
}: GanttChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData>({ item: null as any, visible: false });
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get('window');

  // Generate date range for the chart
  const dateRange = Array.from({ length: daysToShow }, (_, i) => 
    addDaysToDate(startDate, i)
  );

  // Calculate total chart width
  const chartWidth = daysToShow * DAY_WIDTH_PX;

  // Calculate item position and width
  const calculateItemPosition = (item: GanttItem) => {
    const itemStartDate = parseDate(item.startDate);
    const itemEndDate = parseDateEnd(item.endDate);
    const chartStartDate = startDate;
    const chartEndDate = addDaysToDate(startDate, daysToShow - 1);

    // Check if item is visible in current date range
    if (itemEndDate < chartStartDate || itemStartDate > chartEndDate) {
      return null; // Item is outside visible range
    }

    // Calculate visible start and end dates
    const visibleStartDate = itemStartDate < chartStartDate ? chartStartDate : itemStartDate;
    const visibleEndDate = itemEndDate > chartEndDate ? chartEndDate : itemEndDate;

    // Calculate position and width
    const daysFromStart = getDaysBetweenDates(chartStartDate, visibleStartDate) - 1;
    const visibleDays = getDaysBetweenDates(visibleStartDate, visibleEndDate);

    const left = Math.max(0, daysFromStart * DAY_WIDTH_PX);
    const width = Math.max(20, visibleDays * DAY_WIDTH_PX - 2); // Minimum width of 20px

    return { left, width };
  };

  // Group items by vehicle
  const itemsByVehicle = items.reduce((acc, item) => {
    if (!acc[item.vehicleId]) {
      acc[item.vehicleId] = [];
    }
    acc[item.vehicleId].push(item);
    return acc;
  }, {} as Record<string, GanttItem[]>);

  // Handle item long press for tooltip
  const handleItemLongPress = (item: GanttItem) => {
    setTooltip({
      item,
      visible: true
    });
  };

  const hideTooltip = () => {
    setTooltip({ item: null as any, visible: false });
  };

  // Auto-scroll to today on mount
  useEffect(() => {
    if (scrollViewRef.current) {
      const todayIndex = dateRange.findIndex(date => isToday(date));
      if (todayIndex >= 0) {
        const scrollPosition = Math.max(0, todayIndex * DAY_WIDTH_PX - 200);
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
        }, 100);
      }
    }
  }, [startDate]);

  return (
    <View style={styles.container}>
      {/* Main Gantt Chart Container */}
      <View style={styles.chartContainer}>
        <View style={styles.chartContent}>
          <Text style={styles.chartTitle}>Fleet Timeline</Text>

          {/* Date Headers - Fixed at top */}
          <View style={styles.dateHeaderContainer}>
            {/* Vehicle Column Header */}
            <View style={[styles.vehicleColumnHeader, { width: VEHICLE_COLUMN_WIDTH }]}>
              <Text style={styles.vehicleHeaderText}>
                Vehicles ({vehicles.length})
              </Text>
            </View>
            
            {/* Scrollable Date Headers */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              ref={scrollViewRef}
              style={styles.dateHeaderScroll}
            >
              <View style={[styles.dateHeaderRow, { width: chartWidth }]}>
                {dateRange.map((date, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dateHeader,
                      { width: DAY_WIDTH_PX },
                      isToday(date) && styles.todayDateHeader
                    ]}
                  >
                    <Text style={[
                      styles.dateHeaderText,
                      isToday(date) && styles.todayDateHeaderText
                    ]}>
                      {formatGanttDate(date)}
                    </Text>
                    <Text style={[
                      styles.dayHeaderText,
                      isToday(date) && styles.todayDayHeaderText
                    ]}>
                      {format(date, 'EEE')}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Vehicle Rows Content */}
          <ScrollView style={styles.vehicleRowsContainer}>
            {vehicles.map((vehicle) => {
              const vehicleItems = itemsByVehicle[vehicle.id] || [];
              return (
                <View
                  key={vehicle.id}
                  style={[styles.vehicleRow, { height: ROW_HEIGHT }]}
                >
                  {/* Vehicle Info Column - Fixed on left */}
                  <View style={[styles.vehicleInfoColumn, { width: VEHICLE_COLUMN_WIDTH }]}>
                    <View style={styles.vehicleInfoContent}>
                      <View style={styles.vehicleStatusIndicator}>
                        <View style={[
                          styles.statusDot,
                          vehicle.status === 'active' ? styles.statusActive : 
                          vehicle.status === 'maintenance' ? styles.statusMaintenance : styles.statusIdle
                        ]} />
                      </View>
                      <View style={styles.vehicleDetails}>
                        <Text style={styles.vehicleName} numberOfLines={1}>
                          {vehicle.name}
                        </Text>
                        <Text style={styles.vehicleSubtext} numberOfLines={1}>
                          {vehicle.make} {vehicle.model} {vehicle.year}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Timeline Area - Scrollable horizontally */}
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.timelineScroll}
                  >
                    <View style={[styles.timelineArea, { width: chartWidth }]}>
                      {/* Today Indicator */}
                      {dateRange.map((date, dateIndex) => (
                        isToday(date) && (
                          <View
                            key={`today-${dateIndex}`}
                            style={[
                              styles.todayIndicator,
                              {
                                left: dateIndex * DAY_WIDTH_PX,
                                width: DAY_WIDTH_PX
                              }
                            ]}
                          />
                        )
                      ))}

                      {/* Schedule and Maintenance Items */}
                      {vehicleItems.map((item, itemIndex) => {
                        const position = calculateItemPosition(item);
                        if (!position) return null;

                        const isSchedule = item.type === 'schedule';
                        const isMaintenance = item.type === 'maintenance';

                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={[
                              styles.ganttItem,
                              {
                                left: position.left,
                                width: position.width,
                                top: ITEM_MARGIN + (itemIndex % 2) * (ITEM_HEIGHT + ITEM_MARGIN),
                                height: ITEM_HEIGHT,
                                backgroundColor: item.color
                              }
                            ]}
                            onLongPress={() => handleItemLongPress(item)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.ganttItemContent}>
                              <View style={styles.ganttItemIcon}>
                                {isSchedule ? (
                                  <MaterialCommunityIcons name="truck" size={12} color="white" />
                                ) : (
                                  <MaterialIcons name="build" size={12} color="white" />
                                )}
                              </View>
                              <Text style={styles.ganttItemText} numberOfLines={1}>
                                {item.title}
                              </Text>
                              {item.details.urgent && (
                                <MaterialIcons name="warning" size={12} color="#fecaca" />
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              );
            })}

            {/* Empty State */}
            {vehicles.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="truck" size={48} color="#d1d5db" />
                <Text style={styles.emptyStateText}>No vehicles found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Tooltip Modal */}
      {tooltip.visible && tooltip.item && (
        <Modal
          isOpen={tooltip.visible}
          onClose={hideTooltip}
          headerContent={
            <View style={styles.tooltipHeader}>
              {tooltip.item.type === 'schedule' ? (
                <MaterialCommunityIcons name="truck" size={20} color="#3b82f6" />
              ) : (
                <MaterialIcons name="build" size={20} color="#f59e0b" />
              )}
              <View style={styles.tooltipHeaderText}>
                <Text style={styles.tooltipTitle}>{tooltip.item.title}</Text>
                {tooltip.item.details.urgent && (
                  <View style={styles.urgentIndicator}>
                    <MaterialIcons name="warning" size={16} color="#ef4444" />
                    <Text style={styles.urgentText}>Urgent</Text>
                  </View>
                )}
              </View>
            </View>
          }
        >
          <View style={styles.tooltipContent}>
            <View style={styles.tooltipDetails}>
              <View style={styles.tooltipDetailItem}>
                <MaterialIcons name="event" size={16} color="#6b7280" />
                <Text style={styles.tooltipDetailText}>
                  {formatTooltipDate(tooltip.item.startDate)} - {formatTooltipDate(tooltip.item.endDate)}
                </Text>
              </View>
              
              {tooltip.item.details.driverName && (
                <View style={styles.tooltipDetailItem}>
                  <MaterialCommunityIcons name="account" size={16} color="#6b7280" />
                  <Text style={styles.tooltipDetailText}>{tooltip.item.details.driverName}</Text>
                </View>
              )}
              
              {tooltip.item.details.location && (
                <View style={styles.tooltipDetailItem}>
                  <MaterialIcons name="place" size={16} color="#6b7280" />
                  <Text style={styles.tooltipDetailText}>{tooltip.item.details.location}</Text>
                </View>
              )}
              
              {tooltip.item.details.description && (
                <View style={styles.tooltipDetailItem}>
                  <MaterialIcons name="description" size={16} color="#6b7280" />
                  <Text style={styles.tooltipDetailText}>{tooltip.item.details.description}</Text>
                </View>
              )}
              
              <View style={styles.tooltipDetailItem}>
                <MaterialIcons name="info" size={16} color="#6b7280" />
                <Text style={styles.tooltipDetailText}>
                  Status: {tooltip.item.details.status}
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  chartContent: {
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 16,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  vehicleColumnHeader: {
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    padding: 12,
    justifyContent: 'center',
  },
  vehicleHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dateHeaderScroll: {
    flex: 1,
  },
  dateHeaderRow: {
    flexDirection: 'row',
  },
  dateHeader: {
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayDateHeader: {
    backgroundColor: '#eff6ff',
    borderRightColor: '#bfdbfe',
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  todayDateHeaderText: {
    color: '#1d4ed8',
  },
  dayHeaderText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  todayDayHeaderText: {
    color: '#3b82f6',
  },
  vehicleRowsContainer: {
    maxHeight: 400,
  },
  vehicleRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  vehicleInfoColumn: {
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  vehicleInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  vehicleStatusIndicator: {
    marginRight: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#10b981',
  },
  statusMaintenance: {
    backgroundColor: '#f59e0b',
  },
  statusIdle: {
    backgroundColor: '#ef4444',
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  vehicleSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  timelineScroll: {
    flex: 1,
  },
  timelineArea: {
    position: 'relative',
    height: ROW_HEIGHT,
  },
  todayIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#dbeafe',
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
    opacity: 0.5,
  },
  ganttItem: {
    position: 'absolute',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  ganttItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 8,
  },
  ganttItemIcon: {
    marginRight: 4,
  },
  ganttItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 16,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltipHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  urgentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  urgentText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
    marginLeft: 4,
  },
  tooltipContent: {
    gap: 16,
  },
  tooltipDetails: {
    gap: 12,
  },
  tooltipDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltipDetailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
});