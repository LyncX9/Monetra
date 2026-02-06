# Monetra (Financial Intelligence)

> **Version**: 2.2 (Report & Notification Update)  
> **Previously known as**: Pocket Expense Monitor  
> **Status**: Production Ready ✅

**Monetra** is a next-generation personal finance tracker built with **React Native (Expo)**. It combines a futuristic "Deep Blue" glassmorphism aesthetic with robust financial intelligence features, powered by **SQLite** (local caching) and **Firebase** (cloud sync).

---

## 🚀 Key Updates in V2.2

### 1. PDF Report Enhancements
- **App Logo in PDF**: Reports now display the actual Monetra app icon (not just "M")
- **Period Selection**: Choose report period before generating:
  - Hari Ini (Today)
  - Minggu Ini (This Week)
  - Bulan Ini (This Month)
  - Tahun Ini (This Year)
  - Semua Waktu (All Time)

### 2. Smart Notifications
- **24-Hour Reminder**: Get notified if no transaction recorded in 24 hours
- **Bahasa Indonesia**: "Hai! Jangan lupa catat transaksi hari ini ya! 💰"

### 3. Profile Improvements
- **Editable Profile Photo**: Tap avatar in edit mode to pick from gallery
- **Cross-Screen Sync**: Profile photo & name sync between Home and Profile screens
- **WIB Greetings**: Indonesian greetings based on Western Indonesian Time
  - 05:00-10:59: SELAMAT PAGI
  - 11:00-14:59: SELAMAT SIANG
  - 15:00-18:59: SELAMAT SORE
  - 19:00-04:59: SELAMAT MALAM

---

## 🚀 Key Updates in V2.1

This update represents a massive overhaul from the original layout.

### 1. Rebranding to "Monetra"
- **New Identity**: Transformed from a generic utility to a premium financial brand.
- **Visual Language**: Adopted a "Deep Blue" dark theme + Electric Blue accents + Glassmorphism (Blur effects).
- **Assets**: New App Icon, Animated Splash Screen, and adaptive typography.

### 2. Hybrid Backend Architecture (SQLite + Firebase)
- **Local First**: Data is stored instantly in **SQLite** (`expo-sqlite`) for zero-latency UI.
- **Cloud Sync**: Transactions are synchronized to **Firebase Firestore** in the background.
- **Auth**: Anonymous Authentication (persistent) allows users to start immediately without signup friction.

### 3. Advanced Performance Optimization
- **React.memo**: Transaction lists are memoized to prevent re-renders on scroll.
- **useMemo**: Heavy calculations (Chart data, Filter logic) are optimized.
- **FlatList**: Efficient rendering for large datasets.

---

## 📊 Project Compliance Matrix

The following checklist confirms the project meets all required deliverables and technical standards.

| Category | Status | Details |
| :--- | :---: | :--- |
| **Concept & Design** | ✅ | Unique "Monetra" Brand, Deep Blue/Glass UI Consistenct. |
| **Video Demo & Expl** | ⚠️ | **USER REQUIRED**: Please record Video Demo (Business/App/Logic). |
| **Responsive & UX** | ✅ | Fully Responsive (Flexbox), Adaptable to Device Sizes. |
| **Core Functionality** | ✅ | No Crashes (SQLite Safe Mode), All Features (CRUD, Charts) Work. |
| **Code Quality** | ✅ | Service Layer Pattern, TypeScript, Clean Component Structure. |
| **Local Data Storage** | ✅ | `expo-sqlite` implemented for offline-first CRUD. |
| **Auth & Cloud Data** | ✅ | `Firebase Auth` & `Firestore` active and verified. |
| **Animation** | ✅ | Custom Animated Splash, Chart Transitions, Micro-interactions. |
| **Testing** | ✅ | Unit Tests (`TransactionManager`) Passed & Verified. |
| **Performance** | ✅ | Optimized Rendering (`React.memo`, `useMemo`, `FlatList`). |
| **Notifications** | ✅ | 24-hour transaction reminder with `expo-notifications`. |

---

## 🛠️ Technology Stack

- **Framework**: React Native 0.81 (Expo SDK 54)
- **Language**: TypeScript 5.9
- **Local Database**: SQLite (`expo-sqlite`)
- **Cloud Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Anonymous/Google)
- **UI Styling**: Custom Glassmorphism System (`expo-blur`, `expo-linear-gradient`)
- **Charts**: `react-native-chart-kit` with custom Bezier handling
- **Notifications**: `expo-notifications` for smart reminders
- **Image Picker**: `expo-image-picker` for profile photos
- **Testing**: Jest + React Native Testing Library

---

## 📱 Features Overview

### 1. Dashboard (Home)
- **Glass Balance Card**: Real-time Net Worth tracking with "Sparkline" trend.
- **Smart Filters**: Toggle between "Cumulative" and "Daily Change" views.
- **Interactive Charts**: Tap-to-view details on specific days.
- **Profile Photo**: Display synced profile photo in header.
- **WIB Greetings**: Localized Indonesian greetings based on time.

### 2. Financial Analytics
- **Donut Chart**: Spending breakdown by category.
- **Drill-down Filters**: Filter by Month (This Month/Last Month), Category, or Type (Inc/Exp).
- **Export/Import**: Backup data to JSON or Export to CSV (Excel).
- **PDF Reports**: Generate professional reports with period selection.

### 3. Profile & Settings
- **Editable Profile Photo**: Pick from gallery with auto-save.
- **Budgeting**: Set monthly budgets and track utilization.
- **Theme System**: Intelligent Dark/Light mode switching.
- **Currency**: Multi-currency support (IDR, USD, EUR, etc.) with auto-conversion.

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js & npm
- Setup Android Emulator / iOS Simulator
- Firebase Config (Already configured in `src/services/FirebaseService.ts`)

### Steps
```bash
# 1. Clone & Install
cd Monetra
npm install

# 2. Run Tests (Optional but Recommended)
npm test

# 3. Start Application
npx expo start --clear

# 4. Run on Android
Press 'a' in the terminal
```

---

## 📂 Project Structure

```text
Monetra/
├── src/
│   ├── components/       # Reusable UI (GlassCard, Charts)
│   ├── contexts/         # Global State (Theme, Services)
│   ├── navigation/       # Stack & Bottom Tabs
│   ├── screens/          # Main Application Screens
│   ├── services/         # Logic Layer (SQLite, Firebase, Manager)
│   ├── theme/            # Design System Tokens
│   └── utils/            # Formatters & Helpers
├── __tests__/            # Jest Unit Tests
├── assets/               # Images & Fonts
└── app.json              # Expo Configuration
```

---

## 🤝 Contributing

This is a portfolio project demonstrating advanced React Native capabilities. Usage is free under the **0BSD License**.

---

**Last Updated**: Feb 7, 2026  
**Developer**: [Bagas Firmansyah]
