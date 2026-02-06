import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from './firebase.config';

let app;
let auth;
let db;

export const initFirebase = () => {
    if (getApps().length === 0) {
        try {
            // Only initialize if config is valid (check if user updated it)
            if (firebaseConfig.apiKey !== "YOUR_API_KEY" && !firebaseConfig.apiKey.includes("YOUR_API_KEY")) {
                app = initializeApp(firebaseConfig);
                auth = getAuth(app);
                db = getFirestore(app);
                console.log('Firebase initialized');

                // Auto-test connection
                void testConnection();
            } else {
                console.warn('Firebase config missing. Skipping initialization.');
            }
        } catch (e) {
            console.error("Firebase Init Error", e);
        }
    } else {
        app = getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        void testConnection();
    }
};

const testConnection = async () => {
    if (!auth) return;
    try {
        const userCred = await signInAnonymously(auth);
        console.log(`FIREBASE_CONNECTION_TEST: SUCCESS. User ID: ${userCred.user.uid}`);
    } catch (e: any) {
        console.error(`FIREBASE_CONNECTION_TEST: FAILED. Reason: ${e.message}`);
    }
};

export const signIn = async (): Promise<User | null> => {
    if (!auth) return null;
    try {
        const userCredential = await signInAnonymously(auth);
        return userCredential.user;
    } catch (error) {
        console.error('Firebase Auth Error', error);
        return null;
    }
};

export const syncTransaction = async (transaction: any) => {
    if (!db || !auth?.currentUser) return;
    try {
        await setDoc(doc(db, "users", auth.currentUser.uid, "transactions", transaction.id), transaction);
    } catch (e) {
        console.error("Sync Error", e);
    }
}
