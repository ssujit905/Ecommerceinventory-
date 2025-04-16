// App.js

import 'react-native-gesture-handler';
import 'react-native-reanimated';



import React, { useEffect, useState, useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import DrawerNavigator from './navigation/DrawerNavigator';
import LoginScreen from './screens/LoginScreen';
import { UserProvider, UserContext } from './context/UserContext';

const App = () => {
  return (
    <UserProvider>
      <Root />
    </UserProvider>
  );
};

const Root = () => {
  const { user, setUser, setRole } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Assume that the user's displayName holds the role (set during registration)
        const role = currentUser.displayName || 'staff';
        setRole(role);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <DrawerNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
};

export default App;
