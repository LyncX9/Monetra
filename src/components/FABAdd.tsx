import React from "react";
import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const FABAdd: React.FC = () => {
  const nav = useNavigation();
  return <FAB style={styles.fab} icon="plus" onPress={() => (nav as any).navigate("AddTransaction")} />;
};

const styles = StyleSheet.create({
  fab: { position: "absolute", right: 20, bottom: 24, backgroundColor: "#3A86FF" },
});

export default FABAdd;
