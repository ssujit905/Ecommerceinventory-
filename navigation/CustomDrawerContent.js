import React, { useContext, useState } from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { UserContext } from '../context/UserContext';
import colors from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

const CustomDrawerContent = (props) => {
  const { setUser, setRole } = useContext(UserContext);

  // Step 1: State for toggling the Finance dropdown menu
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: colors.drawerBackground }}
    >
      {/* Render other Drawer items */}
      <DrawerItemList {...props} />

      {/* Finance Dropdown */}
      <View>
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setIsFinanceOpen(!isFinanceOpen)} // Toggle dropdown
        >
          <Ionicons name="stats-chart" size={24} color={colors.drawerText} />
          <Text style={styles.dropdownText}>Finance</Text>
          <Ionicons
            name={isFinanceOpen ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.drawerText}
          />
        </TouchableOpacity>

        {isFinanceOpen && (
          <View style={styles.dropdownMenu}>
            <DrawerItem
              label="Purchase"
              labelStyle={styles.subItemText}
              onPress={() => props.navigation.navigate('Purchase')}
            />
            <DrawerItem
              label="Income"
              labelStyle={styles.subItemText}
              onPress={() => props.navigation.navigate('Income')}
            />
            <DrawerItem
              label="Profit/Loss"
              labelStyle={styles.subItemText}
              onPress={() => props.navigation.navigate('Profit/Loss')}
            />
            <DrawerItem

              label="MonthlyProfit"
              labelStyle={styles.subItemText}
              onPress={() => props.navigation.navigate('Monthly Profit')}
            />
          </View>
        )}
      </View>

      {/* Logout */}
      <DrawerItem
        label="Logout"
        labelStyle={{ color: colors.drawerText }}
        icon={({ color, size }) => (
          <Ionicons name="log-out-outline" size={size} color={color} />
        )}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.drawerText,
  },
  dropdownMenu: {
    paddingLeft: 20,
  },
  subItemText: {
    fontSize: 14,
    color: colors.drawerText,
  },
});

export default CustomDrawerContent;
