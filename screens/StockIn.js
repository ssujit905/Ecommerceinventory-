import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  Dimensions,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { db } from "../firebase";
import colors from "../styles/colors";
import { fetchStockIn, addStockIn } from "../services/stockService";

const { width } = Dimensions.get("window");

const EnhancedStockIn = () => {
  // State variables
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [productCode, setProductCode] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [touched, setTouched] = useState({
    productCode: false,
productDetails: false,
    quantity: false,
  });

  // Animation values
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const fabAnimation = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const listAnimation = useRef(new Animated.Value(0)).current;

  // Field validation
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

  // Load stock data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchStockIn();
        setStockData(data);
        setFilteredData(data);
        
// Start list animation after data loads
        Animated.timing(listAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter data when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(stockData);
      return;
    }
    
    const filtered = stockData.filter(
      (item) =>
        item.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productDetails.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredData(filtered);
  }, [searchQuery, stockData]);

  // Handle adding new stock
  const handleAddStock = async () => {
    Keyboard.dismiss();
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
      setFilteredData(updatedData);
      
      Alert.alert(
        "Success", 
        "Stock added successfully!",
        [{ text: "OK", onPress: handleCloseModal }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add stock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open modal with animation
  const handleOpenModal = () => {
    setModalVisible(true);
    // Animate modal and fab
    Animated.parallel([
      Animated.timing(modalAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fabAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
// Close modal with animation
  const handleCloseModal = () => {
    // Animate modal and fab
    Animated.parallel([
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fabAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After animation completes
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
    });
  };

  // Calculate header opacity based on scroll position
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: headerOpacity } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
     // Adjust header opacity based on scroll
        const scrollPosition = event.nativeEvent.contentOffset.y;
        const newOpacity = scrollPosition > 50 ? 0.9 : 1;
        headerOpacity.setValue(newOpacity);
      },
    }
  );

  // Modal animation styles
  const modalScaleAnimation = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const modalTranslateYAnimation = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  // Render item in the list
  const renderItem = ({ item, index }) => {
    // Item animation delay based on position
    const delay = index * 50;
    const itemAnimation = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      // Animate each item with a delay
      Animated.timing(itemAnimation, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }).start();
    }, []);
    
    // Translate and opacity for entry animation
    const translateY = itemAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });
    const opacity = itemAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    
    return (
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY }], opacity }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.serialContainer}>
            <Text style={styles.serialNumber}>{item.serial}</Text>
          </View>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.cardRow}>
            <View style={styles.cardIconContainer}>
              <FontAwesome name="barcode" size={16} color={colors.primary} />
            </View>
            <Text style={styles.cardLabel}>Product Code:</Text>
            <Text style={styles.cardValue}>{item.productCode}</Text>
          </View>
          
          <View style={styles.cardRow}>
            <View style={styles.cardIconContainer}>
              <FontAwesome name="info-circle" size={16} color={colors.primary} />
            </View>
            <Text style={styles.cardLabel}>Details:</Text>
            <Text style={styles.cardValue}>{item.productDetails}</Text>
          </View>
<View style={styles.cardRow}>
            <View style={styles.cardIconContainer}>
              <FontAwesome name="cubes" size={16} color={colors.primary} />
            </View>
            <Text style={styles.cardLabel}>Quantity:</Text>
            <Text style={styles.cardValue}>{item.quantity}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Component UI
  return (
    <View style={styles.container}>
      {/* Header with search bar */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Text style={styles.headerTitle}>Stock In</Text>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={16} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by product code or details..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <FontAwesome name="times-circle" size={16} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
{/* Stock list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading stock data...</Text>
        </View>
      ) : (
        <Animated.View style={[styles.listContainer, { opacity: listAnimation }]}>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FontAwesome name="inbox" size={50} color={colors.lightGray} />
                <Text style={styles.emptyText}>
                  {searchQuery.length > 0
                    ? "No matching stock entries found"
                    : "No stock entries found"}
                </Text>
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearSearchButton}
                    onPress={() => setSearchQuery("")}
                  >
                    <Text style={styles.clearSearchText}>Clear Search</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </Animated.View>
      )}
{/* Add Stock Button */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [
              { scale: fabAnimation },
              { translateY: fabAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                })
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleOpenModal}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={colors.light} />
        </TouchableOpacity>
      </Animated.View>

      {/* Modal for Adding Stock */}
      <Modal
        animationType="none"
        transparent
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <Animated.View
style={[
              styles.modalContent,
              {
                opacity: modalAnimation,
                transform: [
                  { scale: modalScaleAnimation },
                  { translateY: modalTranslateYAnimation },
                ],
              },
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Stock</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseModal}
                  disabled={isSubmitting}
                >
                  <FontAwesome name="times" size={20} color={colors.gray} />
                </TouchableOpacity>
              </View>

              {/* Date Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome name="calendar" size={18} color={colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                {!date && <Text style={styles.errorText}>Date is required</Text>}
              </View>
{/* Product Code Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Code</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome name="barcode" size={18} color={colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={productCode}
                    onChangeText={setProductCode}
                    placeholder="Enter product code"
                    onBlur={() => setTouched((p) => ({ ...p, productCode: true }))}
                  />
                </View>
                {touched.productCode && !productCode.trim() && (
                  <Text style={styles.errorText}>Product Code is required</Text>
                )}
              </View>

              {/* Product Details Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Details</Text>
                <View style={styles.textAreaContainer}>
                  <FontAwesome name="info-circle" size={18} color={colors.primary} style={[styles.inputIcon, { alignSelf: 'flex-start', marginTop: 10 }]} />
                  <TextInput
                    style={styles.textArea}
                    value={productDetails}
                    onChangeText={setProductDetails}
                    placeholder="Enter product details"
                    multiline
                    numberOfLines={4}
                    onBlur={() => setTouched((p) => ({ ...p, productDetails: true }))}
                  />
                </View>
                {touched.productDetails && !productDetails.trim() && (
                  <Text style={styles.errorText}>Product Details are required</Text>
                )}
              </View>
{/* Quantity Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome name="cubes" size={18} color={colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="Enter quantity"
                    keyboardType="numeric"
                    onBlur={() => setTouched((p) => ({ ...p, quantity: true }))}
                  />
                </View>
                {getQuantityError() && (
                  <Text style={styles.errorText}>{getQuantityError()}</Text>
                )}
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    (!isFormValid() || isSubmitting) && styles.disabledButton,
                  ]}
                  onPress={handleAddStock}
                  disabled={!isFormValid() || isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.light} />
                  ) : (
                    <>
                      <FontAwesome name="plus-circle" size={16} color={colors.light} style={{ marginRight: 8 }} />
                      <Text style={styles.buttonText}>Add Stock</Text>
                    </>
                  )}
</TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCloseModal}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="times-circle" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.light,
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Add extra padding for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
loadingText: {
    marginTop: 10,
    color: colors.primary,
    fontSize: 16,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
  clearSearchButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.lightPrimary,
    borderRadius: 20,
  },
  clearSearchText: {
    color: colors.primary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.light,
    borderRadius: 16,
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.lightPrimary,
  },
  serialContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serialNumber: {
    color: colors.light,
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  cardContent: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIconContainer: {
    width: 28,
    alignItems: 'center',
  },
cardLabel: {
    width: 90,
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
  cardValue: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '400',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
  fab: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
modalContent: {
    backgroundColor: colors.light,
    width: width * 0.9,
    maxHeight: '85%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  closeButton: {
    padding: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 8,
  },
  textAreaContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 100,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  buttonContainer: {
    marginTop: 20,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EnhancedStockIn;
