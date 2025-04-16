import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebase";
import colors from "../styles/colors";
import { fetchStockIn, addStockIn } from "../services/stockService";

const StockIn = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [productCode, setProductCode] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    productCode: false,
    productDetails: false,
    quantity: false,
  });

  const isValidQuantity = () => /^\d+$/.test(quantity) && parseInt(quantity) > 0;
  const isFormValid = () =>
    productCode.trim() &&
    productDetails.trim() &&
    isValidQuantity();

  const getQuantityError = () => {
    if (!touched.quantity) return null;
    if (!quantity) return "Quantity is required";
    if (!isValidQuantity()) return "Must be a positive integer";
    return null;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchStockIn();
        setStockData(data);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddStock = async () => {
    setIsSubmitting(true);
    try {
      await addStockIn({
        date,
        productCode: productCode.trim(),
        productDetails: productDetails.trim(),
        quantity: parseInt(quantity),
      });
      const updatedData = await fetchStockIn();
      setStockData(updatedData);
      Alert.alert("Success", "Stock added successfully!");
      handleCloseModal();
    } catch (error) {
      Alert.alert("Error", "Failed to add stock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setDate(new Date().toISOString().split("T")[0]);
    setProductCode("");
    setProductDetails("");
    setQuantity("");
    setTouched({
      productCode: false,
      productDetails: false,
      quantity: false,
    });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={stockData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.serialNumber}>{item.serial}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>Date: {item.date}</Text>
                <Text style={styles.cardText}>Product Code: {item.productCode}</Text>
                <Text style={styles.cardText}>Details: {item.productDetails}</Text>
                <Text style={styles.cardText}>Quantity: {item.quantity}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No stock entries found</Text>}
        />
      )}

      {/* Add Stock Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Modal for Adding Stock */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Stock</Text>

            {/* Date */}
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="Date (YYYY-MM-DD)"
            />
            {!date && <Text style={styles.errorText}>Date is required</Text>}

            {/* Product Code */}
            <TextInput
              style={styles.input}
              value={productCode}
              onChangeText={setProductCode}
              placeholder="Product Code"
              onBlur={() => setTouched((p) => ({ ...p, productCode: true }))}
            />
            {touched.productCode && !productCode.trim() && (
              <Text style={styles.errorText}>Product Code is required</Text>
            )}

            {/* Product Details */}
            <TextInput
              style={styles.input}
              value={productDetails}
              onChangeText={setProductDetails}
              placeholder="Product Details"
              multiline
              onBlur={() => setTouched((p) => ({ ...p, productDetails: true }))}
            />
            {touched.productDetails && !productDetails.trim() && (
              <Text style={styles.errorText}>Product Details are required</Text>
            )}

            {/* Quantity */}
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Quantity"
              keyboardType="numeric"
              onBlur={() => setTouched((p) => ({ ...p, quantity: true }))}
            />
            {getQuantityError() && (
              <Text style={styles.errorText}>{getQuantityError()}</Text>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.addButton, (!isFormValid() || isSubmitting) && styles.disabledButton]}
                onPress={handleAddStock}
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Add</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
  },
  serialNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardText: {
    fontSize: 16,
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: colors.textSecondary,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 50,
    padding: 16,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: colors.background,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginRight: 5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginLeft: 5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default StockIn;
