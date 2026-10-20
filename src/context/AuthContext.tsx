import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User
} from '../firebase.ts';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  quickDemoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Login error:', err);
      // Friendly Thai messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (err.code === 'auth/wrong-password') {
        setError('รหัสผ่านไม่ถูกต้อง');
      } else if (err.code === 'auth/invalid-email') {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
      } else {
        setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('อีเมลนี้ถูกใช้งานแล้วในระบบ');
      } else if (err.code === 'auth/weak-password') {
        setError('รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษร');
      } else {
        setError(err.message || 'สร้างบัญชีไม่สำเร็จ');
      }
      throw err;
    }
  };

  const signInWithGoogleMethod = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(err.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
      throw err;
    }
  };

  const [demoUser, setDemoUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('smart_qr_demo_staff');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const quickDemoLogin = async () => {
    try {
      setError(null);
      const demoEmail = 'admin@smartqr.restaurant';
      const demoPass = 'Staff@Pass123';
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      } catch (err: any) {
        if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
          // Fallback to local demo session if email/password is not enabled in Firebase Console yet
          const fallbackUser: any = {
            uid: 'demo-staff-manager',
            email: demoEmail,
            displayName: 'ผู้จัดการร้านเดโม (Staff Admin)',
            emailVerified: true
          };
          setDemoUser(fallbackUser);
          localStorage.setItem('smart_qr_demo_staff', JSON.stringify(fallbackUser));
          return;
        }
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      // In case of any provider restriction, grant the local demo manager access
      const fallbackUser: any = {
        uid: 'demo-staff-manager',
        email: 'admin@smartqr.restaurant',
        displayName: 'ผู้จัดการร้านเดโม (Staff Admin)',
        emailVerified: true
      };
      setDemoUser(fallbackUser);
      localStorage.setItem('smart_qr_demo_staff', JSON.stringify(fallbackUser));
    }
  };

  const logout = async () => {
    try {
      setDemoUser(null);
      localStorage.removeItem('smart_qr_demo_staff');
      await signOut(auth);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const effectiveUser = currentUser || demoUser;
  const isAdmin = Boolean(effectiveUser);

  return (
    <AuthContext.Provider
      value={{
        currentUser: effectiveUser,
        loading,
        isAdmin,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle: signInWithGoogleMethod,
        quickDemoLogin,
        logout,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
