import React, { useEffect, useState } from "react";
import { View, FlatList, Button, TextInput } from "react-native";
import { useServices } from "../contexts/ServiceContext";
import TransactionListItem from "../components/TransactionListItem";

const TransactionsScreen: React.FC = () => {
  const { transactionManager } = useServices();
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("0");

  useEffect(() => {
    const load = async () => {
      await transactionManager.load();
      setItems(transactionManager.getAll());
    };
    void load();
  }, [transactionManager]);

  const add = async () => {
    const t = await transactionManager.addTransaction({ title: title || "Untitled", amount: parseFloat(amount || "0"), category: "General", type: "expense", date: new Date().toISOString(), note: "" });
    setItems([t, ...items]);
    setTitle("");
    setAmount("0");
  };

  const remove = async (id: string) => {
    await transactionManager.deleteTransaction(id);
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <Button title="Add Transaction" onPress={add} />
      <FlatList data={items} keyExtractor={i => i.id} renderItem={({ item }) => <TransactionListItem item={item} onDelete={remove} />} />
    </View>
  );
};

export default TransactionsScreen;
