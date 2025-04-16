import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import styles from "../styles/salesStyles";
import colors from "../styles/colors";

const getStatusStyle = (status) => {
  switch (status) {
    case "Delivered":
      return { backgroundColor: "#4CAF50" };
    case "Returned":
      return { backgroundColor: "#D32F2F" };
    default:
      return { backgroundColor: "#FFC107" };
  }
};

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    destinationBranch: "",
    customerName: "",
    fullAddress: "",
    phone1: "",
    phone2: "",
    products: [{ productCode: "", quantity: "" }],
    codAmount: "",
    status: "Parcel Processing",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "sales"));
      const salesData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((item, index, array) => ({
          ...item,
          serial: array.length - index,
        }));

      setSales(salesData);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  const fetchUniqueProductCodes = async () => {
    try {
      setProductsLoading(true);
      const stockInSnapshot = await getDocs(collection(db, "stockIn"));
      
      // Get all product codes and remove duplicates
      const allProductCodes = stockInSnapshot.docs
        .map(doc => doc.data().productCode)
        .filter(Boolean);
      
      const uniqueProductCodes = [...new Set(allProductCodes)];
      
      setAvailableProducts(uniqueProductCodes.map(code => ({ productCode: code })));
      setProductsLoading(false);
    } catch (error) {
      console.error("Error fetching product codes:", error);
      setProductsLoading(false);
      Alert.alert("Error", "Failed to load products. Please try again.");
    }
  };

  const handleModalOpen = async () => {
    try {
      await fetchUniqueProductCodes();
      resetForm();
      setModalVisible(true);
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  };

  const handleEditPress = async (item) => {
    try {
      await fetchUniqueProductCodes();
      setFormData(item);
      setEditId(item.id);
      setModalVisible(true);
    } catch (error) {
      console.error("Error editing sale:", error);
    }
  };

  const handleAddProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { productCode: "", quantity: "" }],
    }));
  };

  const handleRemoveProduct = (index) => {
    setFormData((prev) => {
      const updatedProducts = [...prev.products];
      updatedProducts.splice(index, 1);
      return { ...prev, products: updatedProducts };
    });
  };

  const handleInputChange = (name, value, index = null) => {
    if (index !== null) {
      const updatedProducts = [...formData.products];
      updatedProducts[index][name] = value;
      setFormData((prev) => ({ ...prev, products: updatedProducts }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validatePhoneNumber = (phone) => {
    return /^\d{10}$/.test(phone);
  };

  const handleSubmit = async () => {
    if (
      !formData.date ||
      !formData.destinationBranch ||
      !formData.customerName ||
      !formData.fullAddress ||
      !formData.phone1 ||
      !formData.codAmount
    ) {
      Alert.alert("Error", "All fields except Phone No. 2 are required.");
      return;
    }

    if (!validatePhoneNumber(formData.phone1)) {
      Alert.alert("Error", "Phone No. 1 must be exactly 10 digits.");
      return;
    }

    if (formData.phone2 && !validatePhoneNumber(formData.phone2)) {
      Alert.alert("Error", "Phone No. 2 must be exactly 10 digits if provided.");
      return;
    }

    try {
      if (editId) {
        await updateDoc(doc(db, "sales", editId), formData);
      } else {
        await addDoc(collection(db, "sales"), formData);
      }
      fetchSales();
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error saving sales data:", error);
      Alert.alert("Error", "Failed to save sales data.");
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      destinationBranch: "",
      customerName: "",
      fullAddress: "",
      phone1: "",
      phone2: "",
      products: [{ productCode: "", quantity: "" }],
      codAmount: "",
      status: "Parcel Processing",
    });
    setEditId(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSales().finally(() => setRefreshing(false));
  };

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      )}
      
      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.serial}>{item.serial}</Text>
            <View style={styles.cardContent}>
              <Text>{item.date}</Text>
              <Text>{item.destinationBranch}</Text>
              <Text>{item.customerName}</Text>
            </View>
            <View style={[styles.statusContainer, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleEditPress(item)}
            >
              <MaterialIcons name="edit" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleModalOpen}
      >
        <AntDesign name="plus" size={24} color={colors.white} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.modalTitle}>{editId ? "Edit Sale" : "Add New Sale"}</Text>

            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={formData.date}
              onChangeText={(value) => handleInputChange("date", value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Destination Branch"
              value={formData.destinationBranch}
              onChangeText={(value) => handleInputChange("destinationBranch", value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Customer Name"
              value={formData.customerName}
              onChangeText={(value) => handleInputChange("customerName", value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Full Address"
              value={formData.fullAddress}
              multiline
              onChangeText={(value) => handleInputChange("fullAddress", value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone No. 1 (10 digits)"
              value={formData.phone1}
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={(value) => handleInputChange("phone1", value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone No. 2 (Optional)"
              value={formData.phone2}
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={(value) => handleInputChange("phone2", value)}
            />

            {productsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 10 }} />
            ) : (


formData.products.map((product, index) => (
  <View key={index} style={styles.productRow}>
    {/* Product Code Picker - Larger (4 parts) */}
    <View style={{ flex: 4, marginRight: 10 }}>
      <Picker
        selectedValue={product.productCode}
        onValueChange={(value) => handleInputChange("productCode", value, index)}
        style={styles.picker}
        dropdownIconColor={colors.primary}
        mode="dropdown"
      >
        <Picker.Item label="Select Product" value="" />
        {availableProducts.map((prod, i) => (
          <Picker.Item 
            key={i} 
            label={prod.productCode} 
            value={prod.productCode} 
          />
        ))}
      </Picker>
    </View>

    {/* Quantity Input - Smaller (1 part) */}
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.productInput}
        placeholder="Qty"
        value={product.quantity}
        keyboardType="numeric"
        onChangeText={(value) => handleInputChange("quantity", value, index)}
      />
    </View>

    {formData.products.length > 1 && (
      <TouchableOpacity 
        onPress={() => handleRemoveProduct(index)}
        style={styles.removeButton}
      >
        <AntDesign name="minuscircle" size={24} color="red" />
      </TouchableOpacity>




             



                  )}
                </View>
              ))
            )}

            <TouchableOpacity 
              onPress={handleAddProduct} 
              style={styles.addProductButton}
            >
              <AntDesign name="pluscircleo" size={24} color={colors.primary} />
              <Text style={styles.addProductText}>Add Another Product</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="COD Amount"
              value={formData.codAmount}
              keyboardType="numeric"
              onChangeText={(value) => handleInputChange("codAmount", value)}
            />

            <Picker
              selectedValue={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
              style={[styles.picker, { marginBottom: 20 }]}
              dropdownIconColor={colors.primary}
              mode="dropdown"
            >
              <Picker.Item label="Parcel Processing" value="Parcel Processing" />
              <Picker.Item label="Parcel Sent" value="Parcel Sent" />
              <Picker.Item label="Delivered" value="Delivered" />
              <Picker.Item label="Returned" value="Returned" />
            </Picker>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                onPress={handleSubmit} 
                style={[styles.button, styles.saveButton]}
              >
                <Text style={styles.buttonText}>{editId ? "Update" : "Save"}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)} 
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default Sales;
