import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
// Assuming Logo.tsx is adapted to return a React Native Image component or similar
// For now, I'll use a direct Image component with a placeholder or a simple Text logo.
// If Logo.tsx is converted, it would be imported as: import { Logo } from '../ui/Logo';

export function Navigation() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      screenName: 'Dashboard', // Use screenName for navigation
      icon: 'view-dashboard', // MaterialCommunityIcons name
    },
    {
      name: 'Vehicles',
      screenName: 'Vehicles',
      icon: 'truck',
    },
    // Add other navigation items as needed, matching screen names in App.tsx
    // For now, only Dashboard and Vehicles are defined in the mobile App.tsx
    // {
    //   name: 'Drivers',
    //   screenName: 'Drivers',
    //   icon: 'account-group',
    // },
    // {
    //   name: 'Maintenance Orders',
    //   screenName: 'MaintenanceOrders',
    //   icon: 'wrench',
    // },
    // {
    //   name: 'Vehicle Schedules',
    //   screenName: 'VehicleSchedules',
    //   icon: 'calendar-clock',
    // },
    // {
    //   name: 'Schedules Overview',
    //   screenName: 'SchedulesOverview',
    //   icon: 'chart-bar',
    // },
  ];

  // Function to handle navigation
  const handleNavigate = (screenName: string) => {
    navigation.navigate(screenName as never); // Type assertion for simplicity
  };

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        {/* Placeholder for Logo component. If Logo.tsx is converted, use <Logo style={styles.logo} /> */}
        <Image source={require('../../assets/vite.svg')} style={styles.logo} />
        <Text style={styles.logoText}>Flotaris</Text>
      </View>

      {/* Navigation Items */}
      <ScrollView style={styles.navItemsContainer}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => handleNavigate(item.screenName)}
          >
            <MaterialCommunityIcons
              name={item.icon as any} // Type assertion for icon name
              size={24}
              color="#6b7280" // text-text-secondary
            />
            <Text style={styles.navItemText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User Section */}
      <View style={styles.userSection}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userTextContainer}>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email}
            </Text>
            {user?.isAdmin && (
              <Text style={styles.adminBadge}>Admin</Text>
            )}
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={signOut}
        >
          <MaterialIcons name="logout" size={20} color="#6b7280" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // bg-white
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb', // border-gray-200
    paddingTop: 20, // Adjust as needed for safe area
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // border-gray-200
  },
  logo: {
    height: 32, // h-8
    width: 32, // w-8
    resizeMode: 'contain',
  },
  logoText: {
    marginLeft: 12, // ml-3
    fontSize: 20, // text-xl
    fontWeight: 'bold',
    color: '#111827', // text-text-default
  },
  navItemsContainer: {
    flex: 1,
    paddingVertical: 16, // py-4
    paddingHorizontal: 8, // px-2
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, // px-3
    paddingVertical: 12, // py-3
    borderRadius: 8, // rounded-lg
    marginBottom: 4, // space-y-1
  },
  navItemText: {
    marginLeft: 12, // ml-3
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#6b7280', // text-text-secondary
  },
  userSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb', // border-border
    padding: 16, // p-4
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // mb-3
  },
  userAvatar: {
    width: 32, // w-8
    height: 32, // h-8
    backgroundColor: '#bfdbfe', // bg-blue-100
    borderRadius: 16, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12, // ml-3 (for text, but here for avatar)
  },
  userTextContainer: {
    flex: 1,
  },
  userEmail: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#111827', // text-text-default
  },
  adminBadge: {
    fontSize: 12, // text-xs
    color: '#2563eb', // text-primary
    fontWeight: '500', // font-medium
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12, // px-3
    paddingVertical: 8, // py-2
    borderRadius: 8, // rounded-lg
  },
  signOutButtonText: {
    marginLeft: 12, // ml-3
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#6b7280', // text-text-secondary
  },
});
