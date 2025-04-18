import {
  RefreshControl,
  ActivityIndicator,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { FontAwesome } from "@expo/vector-icons";
import moment from "moment";
import dashboardStyles from "../styles/dashboardStyles";
import colors from "../styles/colors";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const Dashboard = () => {
  const [searchText, setSearchText] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [returnedSales, setReturnedSales] = useState(0);
  const [monthlySales, setMonthlySales] = useState({});
  const [previousMonths, setPreviousMonths] = useState([]);
  const [showPreviousMonths, setShowPreviousMonths] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingPreviousMonths, setIsLoadingPreviousMonths] = useState(false);
  const [last7DaysData, setLast7DaysData] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "sales"), async (snapshot) => {
      let salesList = [];
      const monthlyData = {};
      let totalDelivered = 0;
      let totalReturned = 0;

      snapshot.forEach((doc) => {
        const saleData = doc.data();
        salesList.push({ id: doc.id, ...saleData });

        const saleMonth = moment(saleData.date).format("MMM YYYY");

        if (!monthlyData[saleMonth]) {
          monthlyData[saleMonth] = { delivered: 0, returned: 0 };
        }

        if (saleData.status === "Delivered") {
          monthlyData[saleMonth].delivered++;
          totalDelivered++;
        }
        if (saleData.status === "Returned") {
          monthlyData[saleMonth].returned++;
          totalReturned++;
        }
      });

      setSalesData(salesList);
      setTotalSales(totalDelivered);
      setReturnedSales(totalReturned);

      const monthlySalesRef = collection(db, "monthly_sales");
      for (const [month, data] of Object.entries(monthlyData)) {
        const q = query(monthlySalesRef, where("month", "==", month));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          await addDoc(monthlySalesRef, {
            month,
            delivered: data.delivered,
            returned: data.returned,
            timestamp: new Date(),
          });
        } else {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, {
            delivered: data.delivered,
            returned: data.returned,
            timestamp: new Date(),
          });
        }
      }

      const currentMonth = moment().format("MMM YYYY");
      setMonthlySales({
        month: currentMonth,
        delivered: monthlyData[currentMonth]?.delivered || 0,
        returned: monthlyData[currentMonth]?.returned || 0,
      });

      // Update chart data
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const day = moment().subtract(i, "days").format("YYYY-MM-DD");
        last7Days.push(day);
      }

      const dailyCount = last7Days.map((date) =>
        salesList.filter((sale) => sale.date === date).length
      );
      setLast7DaysData({ labels: last7Days.map(d => moment(d).format("DD MMM")), counts: dailyCount });

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredSales([]);
    } else {
      const filtered = salesData.filter((sale) => {
        return (
          sale.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
          sale.phone1?.includes(searchText) ||
          sale.phone2?.includes(searchText)
        );
      });
      setFilteredSales(filtered);
    }
  }, [searchText, salesData]);

  const fetchPreviousMonthsData = async () => {
    try {
      setIsLoadingPreviousMonths(true);
      const q = query(collection(db, "monthly_sales"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const monthsList = querySnapshot.docs.map((doc) => doc.data());
      setPreviousMonths(monthsList);
      setIsLoadingPreviousMonths(false);
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
      setIsLoadingPreviousMonths(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPreviousMonthsData();
    setIsRefreshing(false);
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    setSearchText("");
    setFilteredSales([]);
  };

  if (isLoading) {
    return (
      <View style={dashboardStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={dashboardStyles.container}
      contentContainerStyle={dashboardStyles.contentContainer}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
    >
      {/* Header and Search */}
      <Text style={dashboardStyles.title}>InventoryApp</Text>
      <View style={dashboardStyles.searchContainer}>
        <TouchableOpacity onPress={toggleSearch}>
          <FontAwesome name="search" size={20} color={colors.primary} />
        </TouchableOpacity>
        {isSearchVisible && (
          <TextInput
            style={dashboardStyles.searchInput}
            placeholder="Enter Name or Phone Number"
            value={searchText}
            onChangeText={setSearchText}
          />
        )}
      </View>

      {/* Search Results */}
      {filteredSales.length > 0 && (
        <View>
          {filteredSales.map((item) => (
            <View key={item.id} style={dashboardStyles.salesCard}>
              {item.image && <Image source={{ uri: item.image }} style={dashboardStyles.salesImage} />}
              <Text>Date: {item.date}</Text>
              <Text>Name: {item.customerName}</Text>
              <Text>Phone: {item.phone1}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Product Code: {item.products?.map((p) => p.productCode).join(", ")}</Text>
              <Text>Quantity: {item.products?.map((p) => p.quantity).join(", ")}</Text>

<Text>Destination Branch: {item.destinationBranch}</Text>
<Text>Full Address: {item.fullAddress}</Text>

              <Text>CodAmount: {item.codAmount}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quote Card */}
      <View style={dashboardStyles.quoteCard}>
        <Text style={dashboardStyles.quoteText}>
          “The biggest risk is not taking any risk. In a world that’s changing quickly, the only strategy that is
          guaranteed to fail is not taking risks.”
        </Text>
        <Text style={dashboardStyles.signature}>Sujit Singh Creation</Text>
      </View>

      {/* Sales Metrics */}
      <Text style={dashboardStyles.sectionTitle}>Total Delivered Sales</Text>
      <Text style={dashboardStyles.salesCount}>{totalSales}</Text>

      <Text style={dashboardStyles.sectionTitle}>Total Returned Sales</Text>
      <Text style={dashboardStyles.returnedCount}>{returnedSales}</Text>

      <Text style={dashboardStyles.sectionTitle}>Current Month Sales</Text>
      <Text style={dashboardStyles.monthText}>{monthlySales.month}</Text>
      <Text style={dashboardStyles.deliveredText}>Delivered: {monthlySales.delivered}</Text>
      <Text style={dashboardStyles.returnedText}>Returned: {monthlySales.returned}</Text>

      {/* Last 7 Days Bar Chart */}
      <Text style={dashboardStyles.sectionTitle}>Last 7 Days Sales</Text>
      <BarChart
        data={{
          labels: last7DaysData.labels,
          datasets: [{ data: last7DaysData.counts }],
        }}
        width={screenWidth - 40}
        height={220}
        fromZero
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={{ marginVertical: 10, borderRadius: 10, alignSelf: "center" }}
      />

      {/* Previous Months Toggle */}
      <TouchableOpacity
        style={[dashboardStyles.button, { backgroundColor: colors.primary }]}
        onPress={async () => {
          if (!showPreviousMonths) await fetchPreviousMonthsData();
          setShowPreviousMonths(!showPreviousMonths);
        }}
        disabled={isLoadingPreviousMonths}
      >
        <Text style={dashboardStyles.buttonText}>
          {isLoadingPreviousMonths ? "Loading..." : showPreviousMonths ? "Hide Historical Data" : "Show Historical Data"}
        </Text>
      </TouchableOpacity>

      {/* Previous Months Data */}
      {showPreviousMonths &&
        previousMonths.map((monthData, index) => (
          <View key={index} style={dashboardStyles.monthCard}>
            <Text style={dashboardStyles.monthHeader}>{monthData.month}</Text>
            <Text>Delivered: {monthData.delivered}</Text>
            <Text>Returned: {monthData.returned}</Text>
          </View>
        ))}
    </ScrollView>
  );
};

export default Dashboard;
