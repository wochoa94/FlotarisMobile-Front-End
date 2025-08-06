import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface VehicleStatusDonutChartProps {
  activeCount: number;
  maintenanceCount: number;
  idleCount: number;
}

export function VehicleStatusDonutChart({ 
  activeCount, 
  maintenanceCount, 
  idleCount 
}: VehicleStatusDonutChartProps) {
  const total = activeCount + maintenanceCount + idleCount;
  
  // If no data, show empty state
  if (total === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyChart}>
          <View style={styles.emptyCircle} />
          <Text style={styles.emptyText}>No vehicle data available</Text>
        </View>
      </View>
    );
  }

  // Calculate percentages
  const activePercentage = (activeCount / total) * 100;
  const maintenancePercentage = (maintenanceCount / total) * 100;
  const idlePercentage = (idleCount / total) * 100;

  // Simple visual representation using stacked bars instead of SVG donut
  return (
    <View style={styles.container}>
      {/* Chart representation using stacked bars */}
      <View style={styles.chartContainer}>
        <View style={styles.centerInfo}>
          <Text style={styles.totalNumber}>{total}</Text>
          <Text style={styles.totalLabel}>Total Vehicles</Text>
        </View>
        
        {/* Visual bar representation */}
        <View style={styles.barContainer}>
          {activeCount > 0 && (
            <View style={[
              styles.barSegment,
              { 
                flex: activePercentage,
                backgroundColor: '#10b981'
              }
            ]} />
          )}
          {maintenanceCount > 0 && (
            <View style={[
              styles.barSegment,
              { 
                flex: maintenancePercentage,
                backgroundColor: '#f59e0b'
              }
            ]} />
          )}
          {idleCount > 0 && (
            <View style={[
              styles.barSegment,
              { 
                flex: idlePercentage,
                backgroundColor: '#ef4444'
              }
            ]} />
          )}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
          <View style={styles.legendText}>
            <Text style={styles.legendLabel}>Active</Text>
            <Text style={styles.legendValue}>{activeCount} vehicles ({activePercentage.toFixed(1)}%)</Text>
          </View>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
          <View style={styles.legendText}>
            <Text style={styles.legendLabel}>Maintenance</Text>
            <Text style={styles.legendValue}>{maintenanceCount} vehicles ({maintenancePercentage.toFixed(1)}%)</Text>
          </View>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
          <View style={styles.legendText}>
            <Text style={styles.legendLabel}>Idle</Text>
            <Text style={styles.legendValue}>{idleCount} vehicles ({idlePercentage.toFixed(1)}%)</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 192, // h-48
  },
  emptyChart: {
    alignItems: 'center',
  },
  emptyCircle: {
    width: 96, // w-24
    height: 96, // h-24
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#e5e7eb', // border-gray-200
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280', // text-gray-500
  },
  chartContainer: {
    alignItems: 'center',
    gap: 16,
  },
  centerInfo: {
    alignItems: 'center',
  },
  totalNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b7280', // text-gray-500
  },
  barContainer: {
    flexDirection: 'row',
    width: 200,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6', // bg-gray-100
  },
  barSegment: {
    height: '100%',
  },
  legend: {
    gap: 12,
    alignSelf: 'stretch',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827', // text-gray-900
  },
  legendValue: {
    fontSize: 14,
    color: '#6b7280', // text-gray-500
  },
});