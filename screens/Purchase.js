import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import colors from '../styles/colors';

const Purchase = () => {
  const [stockInData, setStockInData] = useState([]);
  const [unitCosts, setUnitCosts] = useState({});
  const [purchaseData, setPurchaseData] = useState([]);
  const [avgCostData, setAvgCostData] = useState([]);
  const [totalPurchaseCost, setTotalPurchaseCost] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const stockSnapshot = await getDocs(collection(db, 'stockIn'));
      const stockData = stockSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStockInData(stockData);

      const unitCostSnapshot = await getDocs(collection(db, 'unitCosts'));
      const costData = {};
      unitCostSnapshot.docs.forEach(doc => {
        costData[doc.id] = doc.data().unitCost;
      });
      setUnitCosts(costData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const processedData = stockInData.map(item => {
      const key = item.id; // unique per stock entry
      return {
        id: key,
        productCode: item.productCode,
        quantity: item.quantity,
        unitCost: unitCosts[key] ?? '',
        purchaseCost: (unitCosts[key] ?? 0) * item.quantity,
      };
    });
    setPurchaseData(processedData);
  }, [stockInData, unitCosts]);

  useEffect(() => {
    const totalCost = purchaseData.reduce((sum, item) => sum + item.purchaseCost, 0);
    setTotalPurchaseCost(totalCost);
    saveTotalPurchaseCostToFirebase(totalCost);
  }, [purchaseData]);

  useEffect(() => {
    const calculateAndSaveAverageCosts = async () => {
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

      const avgData = [];

      for (const productCode in costSumMap) {
        const avgCost = quantitySumMap[productCode]
          ? parseFloat((costSumMap[productCode] / quantitySumMap[productCode]).toFixed(2))
          : 0;

        await setDoc(doc(db, 'averageCosts', productCode), {
          productCode,
          avgCost
        });

        avgData.push({ productCode, avgCost });
      }

      setAvgCostData(avgData);
    };

    calculateAndSaveAverageCosts();
  }, [purchaseData]);

  const handleUnitCostChange = async (entryId, value) => {
    const newCost = parseFloat(value) || 0;
    setUnitCosts(prev => ({ ...prev, [entryId]: newCost }));

    try {
      await setDoc(doc(db, 'unitCosts', entryId), { unitCost: newCost });
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.tableTitle}>Average Product Cost</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Product Code</Text>
          <Text style={styles.tableHeader}>Avg. Cost ($)</Text>
        </View>
        {avgCostData.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.productCode}</Text>
            <Text style={styles.tableCell}>{item.avgCost.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.tableTitle}>Purchase Details</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Product Code</Text>
          <Text style={styles.tableHeader}>Quantity</Text>
          <Text style={styles.tableHeader}>Unit Cost</Text>
          <Text style={styles.tableHeader}>Total Cost</Text>
        </View>
        {purchaseData.map((item, index) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.productCode}</Text>
            <Text style={styles.tableCell}>{item.quantity}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={unitCosts[item.id]?.toString() || ''}
              onChangeText={value => handleUnitCostChange(item.id, value)}
            />
            <Text style={styles.tableCell}>
              {(unitCosts[item.id] * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

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
