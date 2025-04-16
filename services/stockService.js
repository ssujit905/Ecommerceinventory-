import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export const fetchStockIn = async () => {
  const q = query(collection(db, "stockIn"), orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc, index) => ({
    id: doc.id,
    serial: index + 1,
    ...doc.data(),
  }));
};

export const addStockIn = async (stockData) => {
  await addDoc(collection(db, "stockIn"), stockData);
};
