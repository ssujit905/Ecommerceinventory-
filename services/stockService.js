import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

// Fetch all stock-in entries sorted by date
export const fetchStockIn = async () => {
  try {
    const stockInRef = collection(db, "stockIn");
    const q = query(stockInRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    const data = [];
    let serial = 1;
    
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        serial: serial++,
        ...doc.data(),
      });
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching stock in:", error);
    throw error;
  }
};

// Add a new stock-in entry
export const addStockIn = async (stockData) => {
  try {
    const stockInRef = collection(db, "stockIn");
    await addDoc(stockInRef, {
      ...stockData,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error adding stock:", error);
    throw error;
  }
};
