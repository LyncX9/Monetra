import "react-native-get-random-values";
import React, { useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync();
import AppNavigator from "./src/navigation/AppNavigator";
import { ServicesProvider } from "./src/contexts/ServiceContext";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";

import CustomSplashScreen from './src/screens/CustomSplashScreen';

const AppContent = () => {
  const { theme, isDark } = useTheme();
  const [isShowSplash, setIsShowSplash] = React.useState(true);

  const paperTheme = isDark ? {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      surface: theme.colors.surface,
      error: theme.colors.danger,
    }
  } : {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      surface: theme.colors.surface,
      error: theme.colors.danger,
    }
  };

  if (isShowSplash) {
    return (
      <PaperProvider theme={paperTheme}>
        <CustomSplashScreen onFinish={() => setIsShowSplash(false)} />
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <ServicesProvider>
        <AppNavigator />
      </ServicesProvider>
    </PaperProvider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
