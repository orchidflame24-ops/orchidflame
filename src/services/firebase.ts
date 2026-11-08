import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { UserProfile } from '../types';

// Web app's Firebase configuration for orchidflame-188d9
export const firebaseConfig = {
  apiKey: "AIzaSyCwbmpnnsw45Sdi6HDbYPY_EWUgnTBkZME",
  authDomain: "orchidflame-188d9.firebaseapp.com",
  projectId: "orchidflame-188d9",
  storageBucket: "orchidflame-188d9.firebasestorage.app",
  messagingSenderId: "973551735459",
  appId: "1:973551735459:web:9de2f6b73607a9526b2516",
  measurementId: "G-ZNT9LEBW1Q"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (Safe in SSR / Node / Ad-blocker environments)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.debug("Firebase analytics initialization skipped:", err);
    });
}

// Local storage key for persistent patron authentication
const USER_PROFILE_KEY = 'orchid_flame_user_profile';

/**
 * Validates strictly whether an email is well-formed
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim();
  // Standard strict email RFC regex: checks user part, @, domain part, and valid TLD
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(clean);
};

export const getStoredUserProfile = (): UserProfile | null => {
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    if (!data) return null;
    const parsed: UserProfile = JSON.parse(data);
    // Security clean up: purge any legacy fake account that was automatically set
    if (parsed.email === 'patron@gmail.com' && parsed.displayName === 'Aarav Sharma') {
      localStorage.removeItem(USER_PROFILE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const saveStoredUserProfile = (profile: UserProfile | null) => {
  if (profile) {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(USER_PROFILE_KEY);
  }
};

/**
 * Real-time listener for Firebase authentication state
 */
export const subscribeToAuthState = (callback: (user: UserProfile | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser && firebaseUser.email) {
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        photoURL: firebaseUser.photoURL || undefined,
      };
      saveStoredUserProfile(profile);
      callback(profile);
    }
  });
};

/**
 * Sign in using Google Provider via Firebase securely without fake account fallbacks
 */
export const signInWithGoogle = async (): Promise<UserProfile> => {
  if (auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (!user || !user.email) {
        throw new Error('Google authentication did not provide valid account credentials.');
      }
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || undefined,
      };
      saveStoredUserProfile(profile);
      return profile;
    } catch (err: any) {
      console.warn("Firebase popup auth result:", err);
      // Clean cancellation detection: user clicked cancel or closed popup
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/user-cancelled' ||
        err?.message?.includes('closed-by-user') ||
        err?.message?.includes('popup has been closed')
      ) {
        throw new Error('Sign in was cancelled.');
      }
      throw new Error(err?.message || 'Google sign-in could not be completed. Please try again.');
    }
  }

  throw new Error('Google Sign-In is unavailable. Please verify your internet connection or use Email sign in.');
};

/**
 * Sign in with email - Strictly enforces valid email format
 */
export const signInWithEmail = async (email: string, name?: string): Promise<UserProfile> => {
  const cleanEmail = email.trim().toLowerCase();
  
  if (!cleanEmail) {
    throw new Error('Please enter your email address.');
  }

  if (!isValidEmail(cleanEmail)) {
    throw new Error('Please enter a valid, complete email address (e.g., name@example.com).');
  }

  const derivedName = name?.trim() || cleanEmail.split('@')[0];
  const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
  
  const profile: UserProfile = {
    uid: `email-user-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
    email: cleanEmail,
    displayName: formattedName,
  };

  saveStoredUserProfile(profile);
  return profile;
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase signout error:", e);
    }
  }
  saveStoredUserProfile(null);
};

export { FirebaseUser };
