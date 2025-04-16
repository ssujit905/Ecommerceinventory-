import { StyleSheet } from 'react-native';

export default StyleSheet.create({

  // ScrollView container style
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Content container style
  contentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },

  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginLeft: 10,
    width: '80%',
    alignSelf: 'center',
  },
  salesCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
},


  salesImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'center',
  },
  quoteCard: {
    backgroundColor: "#FFC107",

    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  quoteText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  signature: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 15,
    textAlign: 'center',
    width: '100%',
  },
  salesCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 20,
  },
  returnedCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
  },
  deliveredText: {
    color: '#28a745',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 5,
  },
  returnedText: {
    color: '#dc3545',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  monthCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
