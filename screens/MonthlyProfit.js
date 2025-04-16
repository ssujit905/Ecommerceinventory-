import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  Button, Alert, RefreshControl
} from 'react-native';
import { collection, getDocs, setDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import colors from '../styles/colors';
import { format, parse } from 'date-fns';

const MonthlyProfit = () => {
  const [expenses, setExpenses] = useState(0);
  const [income, setIncome] = useState(0);
  const [productCosts, setProductCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const [previousData, setPreviousData] = useState([]);

  const now = new Date();
  const monthName = format(now, 'MMMM yyyy');
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const docId = `${currentYear}-${currentMonth + 1}`;

  useEffect(() => {
    fetchData();
  }, []);

  const parseDate = (str) => {
    try {
      return parse(str, 'yyyy-MM-dd', new Date());
    } catch {
      return null;
    }
  };

  const fetchData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const start = new Date(currentYear, currentMonth, 1);
      const end = new Date(currentYear, currentMonth + 1, 0);

      let totalExpenses = 0;
      const expenseSnapshot = await getDocs(collection(db, 'expenses'));
      expenseSnapshot.forEach(doc => {
        const data = doc.data();
        const date = parseDate(data.date);
        if (date && date >= start && date <= end) {
          totalExpenses += Number(data.amount || 0);
        }
      });

      let totalIncome = 0;
      const incomeSnapshot = await getDocs(collection(db, 'income'));
      incomeSnapshot.forEach(doc => {
        const data = doc.data();
        const date = parseDate(data.date);
        if (date && date >= start && date <= end) {
          totalIncome += Number(data.amount || 0);
        }
      });

      const avgCostSnapshot = await getDocs(collection(db, 'averageCosts'));
      const avgCostMap = {};
      avgCostSnapshot.forEach(doc => {
        avgCostMap[doc.id] = Number(doc.data().avgCost || 0);
      });

      const productMap = {};
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      salesSnapshot.forEach(doc => {
        const data = doc.data();
        const status = data.status?.toLowerCase();
        const saleDate = parseDate(data.date);
        if (status === 'delivered' && saleDate?.getMonth() === currentMonth && saleDate?.getFullYear() === currentYear) {
          data.products?.forEach(p => {
            const code = p.productCode;
            const qty = Number(p.quantity);
            const cost = avgCostMap[code] || 0;
            if (!productMap[code]) {
              productMap[code] = { quantity: 0, avgCost: cost };
            }
            productMap[code].quantity += qty;
          });
        }
      });

      const productData = Object.keys(productMap).map(code => {
        const { quantity, avgCost } = productMap[code];
        return {
          productCode: code,
          quantity,
          avgCost,
          total: quantity * avgCost,
        };
      });

      const totalProductCost = productData.reduce((sum, item) => sum + item.total, 0);
      const profitLoss = totalIncome - (totalExpenses + totalProductCost);

      const isEmpty = totalIncome === 0 && totalExpenses === 0 && totalProductCost === 0;
      if (!isEmpty) {
        const docRef = doc(db, 'monthlyProfit', docId);
        const existingDoc = await getDoc(docRef);

        const currentData = {
          month: monthName,
          expenses: totalExpenses,
          income: totalIncome,
          profitLoss,
          totalProductCost,
          productData,
          timestamp: Timestamp.now(),
        };

        if (!existingDoc.exists()) {
          await setDoc(docRef, currentData);
        } else {
          const oldData = existingDoc.data();
          if (
            oldData.income !== totalIncome ||
            oldData.expenses !== totalExpenses ||
            oldData.totalProductCost !== totalProductCost ||
            oldData.profitLoss !== profitLoss
          ) {
            await setDoc(docRef, currentData);
          }
        }
      }

      setExpenses(totalExpenses);
      setIncome(totalIncome);
      setProductCosts(productData);
      if (!isRefresh) setLoading(false);
    } catch (error) {
      console.log("Error fetching data:", error);
      if (!isRefresh) setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true).finally(() => setRefreshing(false));
  };

  const togglePrevious = async () => {
    if (!showPrevious) {
      try {
        const snapshot = await getDocs(collection(db, 'monthlyProfit'));
        const data = [];
        snapshot.forEach(doc => data.push(doc.data()));
        setPreviousData(data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
        setShowPrevious(true);
      } catch {
        Alert.alert("Error", "Couldn't fetch previous data");
      }
    } else {
      setShowPrevious(false);
    }
  };

  const totalProductCost = productCosts.reduce((sum, item) => sum + item.total, 0);
  const profitLoss = income - (expenses + totalProductCost);

  if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
      }
    >
      <Text style={styles.title}>{monthName}</Text>
      <Text style={[styles.label, { color: 'red' }]}>Monthly Expenses: ₹{expenses}</Text>
      <Text style={[styles.label, { color: 'green' }]}>Monthly Income: ₹{income}</Text>
      <Text style={[styles.label, { color: profitLoss >= 0 ? 'green' : 'red' }]}>Monthly Profit/Loss: ₹{profitLoss}</Text>

      <Text style={styles.sectionTitle}>Monthly Purchase Cost</Text>
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
          <Text style={styles.rowText}>{item.avgCost}</Text>
          <Text style={styles.rowText}>{item.total.toFixed(2)}</Text>
        </View>
      ))}

      <Text style={styles.label}>Total Monthly Product Cost: ₹{totalProductCost.toFixed(2)}</Text>

      <View style={{ marginTop: 20 }}>
        <Button title={showPrevious ? "Hide" : "Show"} onPress={togglePrevious} color={colors.primary} />
      </View>

      {showPrevious && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Previous Monthly Data</Text>
          {previousData.map((item, index) => (
            <View key={index} style={styles.prevCard}>
              <Text style={styles.prevMonth}>{item.month}</Text>
              <Text style={styles.prevText}>Expenses: ₹{item.expenses}</Text>
              <Text style={styles.prevText}>Income: ₹{item.income}</Text>
              <Text style={styles.prevText}>Profit/Loss: ₹{item.profitLoss}</Text>
              <Text style={styles.prevText}>Product Cost: ₹{item.totalProductCost}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 16, marginVertical: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  headerText: { fontWeight: 'bold', width: '25%' },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowText: { width: '25%' },
  prevCard: { backgroundColor: '#f0f0f0', padding: 10, marginBottom: 10, borderRadius: 8 },
  prevMonth: { fontWeight: 'bold', fontSize: 16 },
  prevText: { fontSize: 14 },
});

export default MonthlyProfit;
