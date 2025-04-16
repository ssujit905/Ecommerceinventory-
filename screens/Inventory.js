import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Dimensions } from "react-native";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import styles from "../styles/inventoryStyles";

const InventoryScreen = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);

      // Fetch data
      const [stockInSnapshot, salesSnapshot] = await Promise.all([
        getDocs(collection(db, "stockIn")),
        getDocs(collection(db, "sales"))
      ]);

      // Process stock in data
      const stockInData = {};
      stockInSnapshot.forEach(doc => {
        const { productCode, quantity } = doc.data();
        stockInData[productCode] = (stockInData[productCode] || 0) + parseInt(quantity);
      });

      // Process sales data
      const stockOutData = {};
      const returnedStock = {};
      salesSnapshot.forEach(doc => {
        const { products, status } = doc.data();
        products.forEach(({ productCode, quantity }) => {
          const qty = parseInt(quantity);
          stockOutData[productCode] = (stockOutData[productCode] || 0) + qty;
          if (status === "Returned") {
            returnedStock[productCode] = (returnedStock[productCode] || 0) + qty;
          }
        });
      });

      // Calculate inventory
      const finalInventory = Object.keys(stockInData).map(productCode => ({
        productCode,
        stockIn: stockInData[productCode] || 0,
        stockOut: (stockOutData[productCode] || 0) - (returnedStock[productCode] || 0),
        availableStock: stockInData[productCode] - ((stockOutData[productCode] || 0) - (returnedStock[productCode] || 0))
      }));

      // Save product codes to Firestore
      await Promise.all(finalInventory.map(async item => {
        await setDoc(doc(db, "products", item.productCode), {
          productCode: item.productCode
        }, { merge: true });
      }));

      setInventoryData(finalInventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInventory(true);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Loading Inventory...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={inventoryData}
      keyExtractor={(item) => item.productCode}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
      ListHeaderComponent={
        <View style={[styles.tableHeader, { width: screenWidth }]}>
          <View style={styles.headerItem}><Text style={styles.headerText}>Product Code</Text></View>
          <View style={styles.headerItem}><Text style={styles.headerText}>Stock In</Text></View>
          <View style={styles.headerItem}><Text style={styles.headerText}>Stock Out</Text></View>
          <View style={styles.headerItem}><Text style={styles.headerText}>Available</Text></View>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.tableRow, { width: screenWidth }]}>
          <View style={styles.cellItem}><Text style={styles.cellText}>{item.productCode}</Text></View>
          <View style={styles.cellItem}><Text style={styles.cellText}>{item.stockIn}</Text></View>
          <View style={styles.cellItem}><Text style={styles.cellText}>{item.stockOut}</Text></View>
          <View style={styles.cellItem}><Text style={styles.cellText}>{item.availableStock}</Text></View>
        </View>
      )}
    />
  );
};

export default InventoryScreen;
