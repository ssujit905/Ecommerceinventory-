import { StyleSheet } from "react-native";
import colors from "./colors"; // Import your existing color theme

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  summaryBox: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: colors.text,
  },
  redText: {
    color: "red",
  },
  greenText: {
    color: "green",
  },
  monthlyProfit: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
    alignItems: "center",
  },
  monthlyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  profitAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },
  showAllButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  showAllText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  monthlyProfitItem: {
    fontSize: 14,
    fontWeight: "bold",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    textAlign: "center",
  },
});

export default styles;
