// Mock Native Modules that cause syntax errors in Jest
jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn(() => ({
        execAsync: jest.fn(),
        runAsync: jest.fn(),
        getAllSync: jest.fn(),
        getFirstAsync: jest.fn(),
    })),
}));

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []),
    getApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    signInAnonymously: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
}));

jest.mock('expo-font', () => ({
    loadAsync: jest.fn(),
}));

jest.mock('react-native-get-random-values', () => ({}));
