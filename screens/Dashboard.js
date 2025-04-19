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
  Animated,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
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
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      setLast7DaysData({ 
        labels: last7Days.map(d => moment(d).format("DD MMM")), 
        counts: dailyCount 
      });

      // Fade in animation when data is loaded
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

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

  if (isLoading) {
    return (
      <View style={dashboardStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 15, color: '#666' }}>Loading your dashboard...</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
    propsForLabels: {
      fontSize: 11,
    },
    barPercentage: 0.5, // Makes bars narrower
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView
        style={dashboardStyles.container}
        contentContainerStyle={dashboardStyles.contentContainer}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
      >
        {/* Header and Search */}
        <View style={dashboardStyles.header}>
          <Text style={dashboardStyles.title}>InventoryApp</Text>
          <View style={[dashboardStyles.searchContainer, { width: screenWidth - 60 }]}>
            <FontAwesome name="search" size={20} color={colors.primary} style={dashboardStyles.searchIcon} />
            <TextInput
              style={dashboardStyles.searchInput}
              placeholder="Search name or phone..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={false}
            />
          </View>
        </View>

        {/* Search Results */}
        {filteredSales.length > 0 ? (
          <View>
            <Text style={dashboardStyles.sectionTitle}>Search Results ({filteredSales.length})</Text>
            {filteredSales.map((item) => (
              <View key={item.id} style={dashboardStyles.salesCard}>
                {item.image && <Image source={{ uri: item.image }} style={dashboardStyles.salesImage} />}
                <View style={dashboardStyles.itemRow}>
                  <Text style={dashboardStyles.itemLabel}>Date:</Text>
                  <Text style={dashboardStyles.itemValue}>{item.date}</Text>
                </View>
                <View style={dashboardStyles.itemRow}>
                  <Text style={dashboardStyles.itemLabel}>Name:</Text>
                  <Text style={dashboardStyles.itemValue}>{item.customerName}</Text>
                </View>
                <View style={dashboardStyles.itemRow}>
                  <Text style={dashboardStyles.itemLabel}>Phone:</Text>
                  <Text style={dashboardStyles.itemValue}>{item.phone1}</Text>
                </View>
                <View style={dashboardStyles.itemRow}>
                  <Text style={dashboardStyles.itemLabel}>Status:</Text>
                  <Text style={[
                    dashboardStyles.itemValue, 
                    { color: item.status === "Delivered" ? "#4CAF50" : "#ff6b6b" }
                  ]}>
                    {item.status}
                  </Text>
                </View>
                <View style={dashboardStyles.itemRow}>
                  <Text style={dashboardStyles.itemLabel}>Product Code:</Text>
                  <Text style={dashboardStyles.itemValue}>{item.products?.map((p) => p.productCode).join(", ")}</Text>
                </View>
                <View style={dashboardStyles.itemRow}>
                  <Text style={dashboardStyles.itemLabel}>Quantity:</Text>
                  <Text style={dashboardStyles.itemValue}>{item.products?.map((p) => p.quantity).join(", ")}</Text>
                </View>
                <View style={dashboardStyles.itemRow}>
                  <Text style={dashboardStyles.itemLabel}>Destination:</Text>
                  <Text style={dashboardStyles.itemValue}>{item.destinationBranch}</Text>
                </View>
                <View style={dashboardStyles.itemRow}>
                  <Text style={dashboardStyles.itemLabel}>Address:</Text>
                  <Text style={dashboardStyles.itemValue}>{item.fullAddress}</Text>
                </View>
                <View style={dashboardStyles.itemRow}>
                  <Text style={dashboardStyles.itemLabel}>COD Amount:</Text>
                  <Text style={dashboardStyles.itemValue}>${item.codAmount}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : searchText.length > 0 ? (
          <Text style={dashboardStyles.noResults}>No matches found for "{searchText}"</Text>
        ) : null}

        {/* Summary Cards Section */}
        {filteredSales.length === 0 && (
          <>
            {/* Quote Card */}
            <View style={dashboardStyles.quoteCard}>
              <Text style={dashboardStyles.quoteText}>
                "The biggest risk is not taking any risk. In a world that's changing quickly, the only strategy that is
                guaranteed to fail is not taking risks."
              </Text>
              <Text style={dashboardStyles.signature}>Sujit Singh Creation</Text>
            </View>

            {/* Key Metrics in a 2-column layout */}
            <Text style={dashboardStyles.sectionTitle}>Sales Overview</Text>
            <View style={dashboardStyles.summaryRow}>
              <View style={[dashboardStyles.summaryCard, { backgroundColor: '#f0f9ff' }]}>
                <Text style={dashboardStyles.summaryTitle}>Total Delivered</Text>
                <Text style={[dashboardStyles.summaryValue, { color: '#4CAF50' }]}>{totalSales}</Text>
              </View>
              <View style={[dashboardStyles.summaryCard, { backgroundColor: '#fff8f8' }]}>
                <Text style={dashboardStyles.summaryTitle}>Total Returned</Text>
                <Text style={[dashboardStyles.summaryValue, { color: '#ff6b6b' }]}>{returnedSales}</Text>
              </View>
            </View>

            {/* Current Month Card */}
            <View style={dashboardStyles.metricsCard}>
              <Text style={[dashboardStyles.sectionTitle, { marginTop: 0 }]}>
                {monthlySales.month} Performance
              </Text>
              <View style={dashboardStyles.statusContainer}>
                <View style={dashboardStyles.statusItem}>
                  <View style={[dashboardStyles.statusDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={dashboardStyles.statusText}>Delivered: {monthlySales.delivered}</Text>
                </View>
                <View style={dashboardStyles.statusItem}>
                  <View style={[dashboardStyles.statusDot, { backgroundColor: '#ff6b6b' }]} />
                  <Text style={dashboardStyles.statusText}>Returned: {monthlySales.returned}</Text>
                </View>
              </View>
            </View>

            {/* Last 7 Days Bar Chart - Updated to show all 7 days */}
            <Text style={dashboardStyles.sectionTitle}>Sales Trend (Last 7 Days)</Text>
            <View style={[dashboardStyles.chartContainer, { paddingHorizontal: 0 }]}>
              <BarChart
                data={{
                  labels: last7DaysData.labels,
                  datasets: [{ 
                    data: last7DaysData.counts,
                    colors: last7DaysData.counts.map((value) => 
                      value >= 5 ? () => colors.primary : () => colors.lightPrimary
                    )
                  }],
                }}
                width={screenWidth - 20}  // Reduced width to fit all bars
                height={220}
                fromZero
                showValuesOnTopOfBars
                chartConfig={chartConfig}
                style={{ 
                  borderRadius: 12,
                  marginLeft: -15,  // Negative margin to compensate
                }}
                verticalLabelRotation={30}
                withInnerLines={false}
                yAxisSuffix=""
              />
            </View>

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
            {showPreviousMonths && (
              <>
                <Text style={dashboardStyles.sectionTitle}>Historical Performance</Text>
                {previousMonths.map((monthData, index) => (
                  <View key={index} style={dashboardStyles.monthCard}>
                    <Text style={dashboardStyles.monthHeader}>{monthData.month}</Text>
                    <View style={dashboardStyles.statusContainer}>
                      <View style={dashboardStyles.statusItem}>
                        <View style={[dashboardStyles.statusDot, { backgroundColor: '#4CAF50' }]} />
                        <Text style={dashboardStyles.statusText}>Delivered: {monthData.delivered}</Text>
                      </View>
                      <View style={dashboardStyles.statusItem}>
                        <View style={[dashboardStyles.statusDot, { backgroundColor: '#ff6b6b' }]} />
                        <Text style={dashboardStyles.statusText}>Returned: {monthData.returned}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </Animated.View>
  );
};

export default Dashboard;
