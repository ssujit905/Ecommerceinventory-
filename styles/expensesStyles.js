import { StyleSheet } from 'react-native';
import colors from './colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
  },

  serial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 10,
  },
  date: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
    color: colors.text,
  },
  amount: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: colors.text,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: colors.black,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,

  },
row: {
  justifyContent: "space-between",
  marginBottom: 10, // Space between rows
},

card: {
  flex: 1,
  backgroundColor: "#fff",
  padding: 15,
  marginHorizontal: 5,
  borderRadius: 10,
  elevation: 3,
  alignItems: "center",
  justifyContent: "center",
},





  buttonText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
