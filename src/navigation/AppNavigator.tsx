import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import HomeScreen from "../screens/HomeScreen"
import AddTransactionScreen from "../screens/AddTransactionScreen"
import TransactionDetail from "../screens/TransactionDetail"
import SettingsScreen from "../screens/SettingsScreen"
import AnalyticsScreen from "../screens/AnalyticsScreen"
import ProfileScreen from "../screens/ProfileScreen"
import { useTheme } from "../contexts/ThemeContext"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

interface TabIconConfig {
  name: keyof typeof Ionicons.glyphMap
  outlineName: keyof typeof Ionicons.glyphMap
}

const TAB_ICONS: Record<string, TabIconConfig> = {
  HomeTab: { name: 'home', outlineName: 'home-outline' },
  StatsTab: { name: 'stats-chart', outlineName: 'stats-chart-outline' },
  Add: { name: 'add', outlineName: 'add' },
  SettingsTab: { name: 'settings', outlineName: 'settings-outline' },
  ProfileTab: { name: 'person', outlineName: 'person-outline' },
}

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { theme, isDark } = useTheme()

  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={isDark
          ? ['rgba(20, 30, 45, 0.98)', 'rgba(10, 18, 28, 0.99)']
          : ['rgba(255,255,255,0.95)', 'rgba(240,245,255,0.98)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <BlurView intensity={isDark ? 40 : 20} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />

      <View style={[styles.topBorder, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

      <View style={styles.tabBarContent}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key]
          const isFocused = state.index === index
          const isAddButton = route.name === 'Add'

          const iconConfig = TAB_ICONS[route.name]
          const iconName = isFocused ? iconConfig.name : iconConfig.outlineName
          const iconColor = isFocused ? '#0066FF' : (isDark ? '#6B7280' : '#9CA3AF')

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          if (isAddButton) {
            return (
              <View key={route.key} style={styles.fabContainer}>
                {/* Glow effect */}
                <View style={styles.fabGlow} />
                <LinearGradient
                  colors={['#0066FF', '#00B4FF']}
                  style={styles.fab}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <TouchableOpacity style={styles.fabTouch} onPress={onPress}>
                    <Ionicons name="add" size={28} color="#FFF" />
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )
          }

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
            >
              <Ionicons name={iconName} size={24} color={iconColor} />
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const EmptyScreen = () => null

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="StatsTab" component={AnalyticsScreen} />
      <Tab.Screen name="Add" component={EmptyScreen} listeners={({ navigation }) => ({
        tabPress: (e) => {
          e.preventDefault()
          navigation.navigate('AddTransaction')
        },
      })} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

const AppNavigator: React.FC = () => {
  const { theme, isDark } = useTheme()

  const navTheme = isDark ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: theme.colors.background,
      card: theme.colors.backgroundSecondary,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      card: theme.colors.backgroundSecondary,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{
            headerShown: true,
            title: "Add Transaction",
            headerStyle: { backgroundColor: theme.colors.backgroundSecondary },
            headerTintColor: theme.colors.textPrimary,
          }}
        />
        <Stack.Screen
          name="TransactionDetail"
          component={TransactionDetail}
          options={{
            headerShown: true,
            title: "Details",
            headerStyle: { backgroundColor: theme.colors.backgroundSecondary },
            headerTintColor: theme.colors.textPrimary,
          }}
        />
        <Stack.Screen
          name="EditTransaction"
          component={require('../screens/EditTransactionScreen').default}
          options={{
            headerShown: true,
            title: "Edit Transaction",
            headerStyle: { backgroundColor: theme.colors.backgroundSecondary },
            headerTintColor: theme.colors.textPrimary,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'visible',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  fabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
  },
  fabGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0066FF',
    opacity: 0.25,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabTouch: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default AppNavigator