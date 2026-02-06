import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { theme } from "./theme/theme";
import { ServicesProvider } from "./contexts/ServiceContext";
import AppNavigator from "./navigation/AppNavigator";

const AppRoot: React.FC = () => {
  return (
    <PaperProvider theme={theme}>
      <ServicesProvider>
        <AppNavigator />
      </ServicesProvider>
    </PaperProvider>
  );
};

export default AppRoot;
