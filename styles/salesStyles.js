import { StyleSheet } from "react-native";
import colors from "./colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  card: {
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  serial: {
    fontWeight: "bold",
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  statusContainer: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  fab: {
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    position: "absolute",
    right: 20,
    bottom: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginVertical: 8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  productInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    flex: 1,
    fontSize: 16,
  },
  addProductButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  addProductText: {
    marginLeft: 5,
    fontSize: 16,
    color: colors.primary,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#999",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
});

export default styles;
