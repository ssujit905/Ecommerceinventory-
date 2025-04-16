import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import colors from '../styles/colors';

const ProfitLossScreen = () => {
  const [expenses, setExpenses] = useState(0);
  const [purchasedAmount, setPurchasedAmount] = useState(0);
  const [income, setIncome] = useState(0);
  const [investment, setInvestment] = useState(0);
  const [productCosts, setProductCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // <-- new state

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchData = async () => {
    try {
      let totalExpenses = 0;
      const expensesSnapshot = await getDocs(collection(db, 'expenses'));
      expensesSnapshot.forEach(doc => {
        totalExpenses += Number(doc.data().amount || 0);
      });

      let totalIncome = 0;
      const incomeSnapshot = await getDocs(collection(db, 'income'));
      incomeSnapshot.forEach(doc => {
        totalIncome += Number(doc.data().amount || 0);
      });

      let totalInvestment = 0;
      const investmentSnapshot = await getDocs(collection(db, 'investment'));
      investmentSnapshot.forEach(doc => {
        totalInvestment += Number(doc.data().amount || 0);
      });

      let purchaseSummaryValue = 0;
      const purchaseSummarySnapshot = await getDocs(collection(db, 'purchaseSummary'));
      purchaseSummarySnapshot.forEach(doc => {
        purchaseSummaryValue += Number(doc.data().value || 0);
      });

      const salesSnapshot = await getDocs(collection(db, 'sales'));
      const avgCostsSnapshot = await getDocs(collection(db, 'averageCosts'));
      const avgCostMap = {};

      avgCostsSnapshot.forEach((doc) => {
        avgCostMap[doc.id] = doc.data().avgCost || 0;
      });

      const productCostMap = {};

      salesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status !== "delivered" && data.status !== "Delivered") return;

        data.products?.forEach((product) => {
          const code = product.productCode;
          const qty = parseInt(product.quantity);
          const unitCost = avgCostMap[code] || 0;

          if (!productCostMap[code]) {
            productCostMap[code] = { quantity: 0, unitCost };
          }

          productCostMap[code].quantity += qty;
        });
      });

      const productCostData = Object.keys(productCostMap).map((code) => {
        const { quantity, unitCost } = productCostMap[code];
        return {
          productCode: code,
          quantity,
          unitCost,
          totalCost: quantity * unitCost,
        };
      });

      setExpenses(totalExpenses);
      setIncome(totalIncome);
      setInvestment(totalInvestment);
      setPurchasedAmount(purchaseSummaryValue);
      setProductCosts(productCostData);
      setLoading(false);
    } catch (err) {
      console.log('Error fetching data:', err);
    }
  };

  const totalProductCost = productCosts.reduce((sum, item) => sum + item.totalCost, 0);
  const totalProfitLoss = income - (expenses + purchasedAmount);
  const cashInHand = (income + investment) - (expenses + purchasedAmount);
  const remainingStockValue = purchasedAmount - totalProductCost;

  if (loading && !refreshing)
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={[styles.label, { color: 'red' }]}>Total Expenses: ₹{expenses}</Text>
      <Text style={styles.label}>Total Purchased Amount: ₹{purchasedAmount}</Text>
      <Text style={[styles.label, { color: 'green' }]}>Total Income: ₹{income}</Text>
      <Text style={[styles.label, { color: 'orange' }]}>Total Investment: ₹{investment}</Text>

      <Text style={styles.label}>Cash in Hand: ₹{cashInHand}</Text>
      <Text style={styles.label}>Remaining Stock Value: ₹{remainingStockValue}</Text>
<Text style={[styles.label1, { color: totalProfitLoss >= 0 ? 'green' : 'red' }]}>Total Profit/Loss: ₹{totalProfitLoss}</Text>



      <Text style={styles.title}>Product Cost Table</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Code</Text>
        <Text style={styles.headerText}>Qty</Text>
        <Text style={styles.headerText}>Unit</Text>
        <Text style={styles.headerText}>Total</Text>
      </View>

      {productCosts.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={styles.rowText}>{item.productCode}</Text>
          <Text style={styles.rowText}>{item.quantity}</Text>
          <Text style={styles.rowText}>{item.unitCost}</Text>
          <Text style={styles.rowText}>{item.totalCost.toFixed(2)}</Text>
        </View>
      ))}

      <Text style={[styles.label, { marginTop: 10 }]}>
        Total Product Cost: ₹{totalProductCost.toFixed(2)}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginVertical: 6,
    fontWeight: 'bold',
  },
label1: {
    fontSize: 22,

    marginVertical: 6,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 6,
  },
  headerText: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  rowText: {
    flex: 1,
    textAlign: 'center',
  },
});

export default ProfitLossScreen;
