// screens/UserRoles.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from '../firebase';
import colors from '../styles/colors';
import { UserContext } from '../context/UserContext';

const UserRoles = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('staff'); // default role
  const { setRole: setUserRole } = useContext(UserContext);

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // Update the user's profile so that displayName holds the role
        updateProfile(user, { displayName: selectedRole })
          .then(() => {
            Alert.alert('Success', 'User registered successfully');
            // Optionally update context so the app immediately recognizes the new role
            setUserRole(selectedRole);
          });
      })
      .catch((error) => {
        Alert.alert('Registration Error', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Role:</Text>
        <Picker
          selectedValue={selectedRole}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedRole(itemValue)}
        >
          <Picker.Item label="Admin" value="admin" />
          <Picker.Item label="Staff" value="staff" />
        </Picker>
      </View>
      <TouchableOpacity onPress={handleSignUp} style={styles.button}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: colors.white,
    color: colors.text,
  },
  pickerContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: colors.text,
  },
  picker: {
    height: 50,
    width: '100%',
    color: colors.text,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
  },
});

export default UserRoles;
