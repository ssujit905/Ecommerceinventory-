import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList, StyleSheet } from "react-native";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Ensure correct Firebase import

const IncomeScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [entryType, setEntryType] = useState(""); // "income" or "investment"
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default to today
    const [details, setDetails] = useState("");
    const [amount, setAmount] = useState("");
    const [incomeEntries, setIncomeEntries] = useState([]);
    const [investmentEntries, setInvestmentEntries] = useState([]);

    // Fetch existing income & investment data
    useEffect(() => {
        const fetchData = async () => {
            const incomeCollection = collection(db, "income");
            const investmentCollection = collection(db, "investment");

            const incomeSnapshot = await getDocs(incomeCollection);
            const investmentSnapshot = await getDocs(investmentCollection);

            setIncomeEntries(incomeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setInvestmentEntries(investmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchData();
    }, []);

    // Function to handle adding new entry
    const handleAddEntry = async () => {
        if (!date || !details || !amount) {
            alert("All fields are required!");
            return;
        }

        const entryData = { date, details, amount };

        try {
            if (entryType === "income") {
                await addDoc(collection(db, "income"), entryData);
                setIncomeEntries(prev => [...prev, { id: Date.now().toString(), ...entryData }]);
            } else {
                await addDoc(collection(db, "investment"), entryData);
                setInvestmentEntries(prev => [...prev, { id: Date.now().toString(), ...entryData }]);
            }
            setModalVisible(false);
            setDate(new Date().toISOString().split("T")[0]); // Reset to today
            setDetails("");
            setAmount("");
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* 🔹 Buttons for Adding Investment & Income */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setEntryType("investment");
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.buttonText}>+ Add Investment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setEntryType("income");
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.buttonText}>+ Add Income</Text>
                </TouchableOpacity>
            </View>

            {/* 🔹 Investments Section */}
            <FlatList
                data={investmentEntries}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={<Text style={styles.sectionTitle}>Investments</Text>}
                renderItem={({ item }) => (
                    <View style={[styles.card, styles.investmentCard]}>
                        <Text style={styles.cardType}>INVESTMENT</Text>
                        <Text style={styles.cardDate}>{item.date}</Text>
                        <Text style={styles.cardDetails}>{item.details}</Text>
                        <Text style={styles.cardAmount}>${item.amount}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.noDataText}>No investments yet.</Text>}
            />

            {/* 🔹 Incomes Section */}
            <FlatList
                data={incomeEntries}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={<Text style={styles.sectionTitle}>Incomes</Text>}
                renderItem={({ item }) => (
                    <View style={[styles.card, styles.incomeCard]}>
                        <Text style={styles.cardType}>INCOME</Text>
                        <Text style={styles.cardDate}>{item.date}</Text>
                        <Text style={styles.cardDetails}>{item.details}</Text>
                        <Text style={styles.cardAmount}>${item.amount}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.noDataText}>No income records yet.</Text>}
            />

            {/* 🔹 Modal for Adding Entries */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add {entryType === "income" ? "Income" : "Investment"}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Date (YYYY-MM-DD)"
                            value={date}
                            onChangeText={setDate}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Details"
                            value={details}
                            onChangeText={setDetails}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleAddEntry}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default IncomeScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: "#f5f5f5" },
    buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
    addButton: { backgroundColor: "#1E88E5", padding: 10, borderRadius: 5 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
    card: { backgroundColor: "#fff", padding: 10, marginVertical: 5, borderRadius: 5 },
    investmentCard: { borderLeftWidth: 5, borderLeftColor: "#FF3D00" },
    incomeCard: { borderLeftWidth: 5, borderLeftColor: "#4CAF50" },
    cardType: { fontWeight: "bold", fontSize: 14 },
    cardDate: { color: "#757575" },
    cardDetails: { fontSize: 16, fontWeight: "600" },
    cardAmount: { fontSize: 18, fontWeight: "bold", color: "#212121" },
    noDataText: { textAlign: "center", color: "#757575", fontStyle: "italic", marginTop: 5 },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { width: "80%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginVertical: 5, borderRadius: 5 },
    modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    saveButton: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 5 },
    cancelButton: { backgroundColor: "#FF3D00", padding: 10, borderRadius: 5 }
});
