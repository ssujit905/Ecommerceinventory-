import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import colors from '../styles/colors';

const Purchase = () => {
  const [stockInData, setStockInData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [unitCosts, setUnitCosts] = useState({});
  const [totalPurchaseCost, setTotalPurchaseCost] = useState(0);
  const [avgCostData, setAvgCostData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      // Fetch Stock In Data
      const stockSnapshot = await getDocs(collection(db, 'stockIn'));
      const stockData = stockSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStockInData(stockData);

      // Fetch Unit Costs
      const unitCostSnapshot = await getDocs(collection(db, 'unitCosts'));
      const costData = {};
      unitCostSnapshot.docs.forEach(doc => {
        costData[doc.id] = doc.data().unitCost;
      });
      setUnitCosts(costData);

      // Fetch Average Costs
      const avgCostSnapshot = await getDocs(collection(db, 'averageCosts'));
      const avgData = avgCostSnapshot.docs.map(doc => ({
        productCode: doc.id,
        ...doc.data()
      }));
      setAvgCostData(avgData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Process purchase data
  useEffect(() => {
    if (stockInData.length > 0) {
      const processedData = stockInData.map(item => ({
        productCode: item.productCode,
        quantity: item.quantity,
        unitCost: unitCosts[item.productCode] || '',
        purchaseCost: (unitCosts[item.productCode] || 0) * item.quantity,
      }));
      setPurchaseData(processedData);
    }
  }, [stockInData, unitCosts]);

  // Calculate and save total purchase cost
  useEffect(() => {
    const totalCost = purchaseData.reduce((sum, item) => sum + item.purchaseCost, 0);
    setTotalPurchaseCost(totalCost);
    saveTotalPurchaseCostToFirebase(totalCost);
  }, [purchaseData]);

  // Calculate and save average costs
  useEffect(() => {
    const calculateAndSaveAverageCosts = async () => {
      const avgCostMap = {};
      const costSumMap = {};
      const quantitySumMap = {};

      purchaseData.forEach(item => {
        if (!costSumMap[item.productCode]) {
          costSumMap[item.productCode] = 0;
          quantitySumMap[item.productCode] = 0;
        }
        costSumMap[item.productCode] += item.purchaseCost;
        quantitySumMap[item.productCode] += item.quantity;
      });

      for (const productCode in costSumMap) {
        const avgCost = costSumMap[productCode] / quantitySumMap[productCode];
        avgCostMap[productCode] = avgCost;
        
        // Save complete average cost data
        await setDoc(doc(db, 'averageCosts', productCode), {
          productCode,
          avgCost
        });
      }

      const avgData = Object.entries(avgCostMap).map(([productCode, avgCost]) => ({
        productCode,
        avgCost
      }));
      setAvgCostData(avgData);
    };

    calculateAndSaveAverageCosts();
  }, [purchaseData]);

  const handleUnitCostChange = async (productCode, value) => {
    const newCost = parseFloat(value) || 0;
    setUnitCosts(prev => ({ ...prev, [productCode]: newCost }));
    
    try {
      await setDoc(doc(db, 'unitCosts', productCode), { unitCost: newCost });
    } catch (error) {
      console.error('Error saving unit cost:', error);
    }
  };

  const saveTotalPurchaseCostToFirebase = async (totalCost) => {
    try {
      await setDoc(doc(db, 'purchaseSummary', 'totalPurchaseCost'), { value: totalCost });
    } catch (error) {
      console.error('Error saving total purchase cost:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {/* Average Cost Table */}
      <Text style={styles.tableTitle}>Average Product Cost</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Product Code</Text>
          <Text style={styles.tableHeader}>Avg. Cost ($)</Text>
        </View>
        {avgCostData.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.productCode}</Text>
            <Text style={styles.tableCell}>{item.avgCost?.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Purchase Data Table */}
      <Text style={styles.tableTitle}>Purchase Details</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Product Code</Text>
          <Text style={styles.tableHeader}>Quantity</Text>
          <Text style={styles.tableHeader}>Unit Cost</Text>
          <Text style={styles.tableHeader}>Total Cost</Text>
        </View>
        {purchaseData.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.productCode}</Text>
            <Text style={styles.tableCell}>{item.quantity}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={unitCosts[item.productCode]?.toString() || ''}
              onChangeText={value => handleUnitCostChange(item.productCode, value)}
            />
            <Text style={styles.tableCell}>
              {(unitCosts[item.productCode] * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Total Purchase Cost */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Total Purchase Cost: ${totalPurchaseCost.toFixed(2)}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 15,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: colors.primary,
    textAlign: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: colors.white,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
  },
  tableHeader: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.dark,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    padding: 8,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  totalContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: colors.lightPrimary,
    borderRadius: 8,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
});

export default Purchase;
