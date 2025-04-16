import { StyleSheet } from "react-native";
import colors from "./colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    marginBottom: 12,
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  serial: {
    fontWeight: "bold",
    fontSize: 16,
    color: colors.primary,
    minWidth: 30,
    textAlign: "center",
  },
  cardContent: {
    flex: 1,
    marginHorizontal: 10,
  },
  statusContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    minWidth: 100,
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "uppercase",
  },
  fab: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    position: "absolute",
    right: 24,
    bottom: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },




  pickerItem: {
    fontSize: 16,
  },







  addProductButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#e9f5ff",
    borderRadius: 8,
    justifyContent: "center",
  },
  addProductText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    marginTop: 15,
    marginBottom: 5,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginTop: 5,
  },
  productCodeLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 5,


  },





productRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 8,
},
picker: {
  flex: 3,   // Takes 4 parts of available space

  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  marginVertical: 8,
  height: 50,
},
productInput: {
  flex: 2,  // Takes 1 part of available space
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  padding: 10,
  textAlign: 'center',
  height: 50,  // Match height with picker
},
removeButton: {
  marginLeft: 10,
},















});

export default styles;
