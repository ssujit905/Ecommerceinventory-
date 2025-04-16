import { StyleSheet } from "react-native";
import colors from "./colors"; // Ensure colors.js exists

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.text,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: colors.black,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
  },
  investmentCard: {
    borderLeftWidth: 5,
    borderLeftColor: colors.secondary,
  },
  incomeCard: {
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  cardType: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 14,
    color: colors.text,
  },
  cardDetails: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
});
