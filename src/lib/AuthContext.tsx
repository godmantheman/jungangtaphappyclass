import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: 'super_admin' | 'teacher';
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  adminData: AdminUser | null;
  loading: boolean;
  adminList: AdminUser[];
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addAdminEmail: (email: string, name: string) => Promise<void>;
  removeAdmin: (uid: string) => Promise<void>;
  refreshAdminList: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  adminData: null,
  loading: true,
  adminList: [],
  loginWithGoogle: async () => {},
  logout: async () => {},
  addAdminEmail: async () => {},
  removeAdmin: async () => {},
  refreshAdminList: async () => {},
});

// Primary designated super admin email from environment
export const SUPER_ADMIN_EMAIL = '0319sea2@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAdminStatus = async (currentUser: User | null) => {
    if (!currentUser || !currentUser.email) {
      setIsAdmin(false);
      setAdminData(null);
      return;
    }

    const email = currentUser.email.toLowerCase();
    const isSuper = email === SUPER_ADMIN_EMAIL.toLowerCase();

    try {
      const adminDocRef = doc(db, 'admins', currentUser.uid);
      const adminSnap = await getDoc(adminDocRef);

      if (isSuper) {
        setIsAdmin(true);
        const data: AdminUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || '최고 관리자',
          role: 'super_admin',
          photoURL: currentUser.photoURL || undefined,
        };
        setAdminData(data);
        // Ensure registered in admins collection
        await setDoc(adminDocRef, {
          ...data,
          lastLogin: serverTimestamp(),
        }, { merge: true });
      } else if (adminSnap.exists()) {
        setIsAdmin(true);
        setAdminData(adminSnap.data() as AdminUser);
      } else {
        // Check by email in admins collection
        const querySnap = await getDocs(collection(db, 'admins'));
        const matched = querySnap.docs.find(d => (d.data().email || '').toLowerCase() === email);
        if (matched) {
          setIsAdmin(true);
          const data: AdminUser = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || matched.data().name || '특수교사',
            role: 'teacher',
            photoURL: currentUser.photoURL || undefined,
          };
          setAdminData(data);
          // Also set the doc by UID for fast future lookup
          await setDoc(adminDocRef, {
            ...data,
            lastLogin: serverTimestamp(),
          }, { merge: true });
        } else {
          setIsAdmin(false);
          setAdminData(null);
        }
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      // Fallback for super admin
      if (isSuper) {
        setIsAdmin(true);
        setAdminData({
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || '최고 관리자',
          role: 'super_admin',
        });
      } else {
        setIsAdmin(false);
        setAdminData(null);
      }
    }
  };

  const refreshAdminList = async () => {
    try {
      const snap = await getDocs(collection(db, 'admins'));
      const list: AdminUser[] = snap.docs.map(d => ({
        uid: d.id,
        ...d.data(),
      } as AdminUser));
      setAdminList(list);
    } catch (err) {
      console.error('Error fetching admin list:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      await checkAdminStatus(currUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      refreshAdminList();
    }
  }, [isAdmin]);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await checkAdminStatus(result.user);
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      alert('로그인에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setIsAdmin(false);
      setAdminData(null);
    } catch (err) {
      console.error('Sign Out failed:', err);
    }
  };

  const addAdminEmail = async (email: string, name: string) => {
    if (!isAdmin) throw new Error('관리자 권한이 필요합니다.');
    const cleanEmail = email.trim().toLowerCase();
    const docId = `admin_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await setDoc(doc(db, 'admins', docId), {
      email: cleanEmail,
      name: name.trim(),
      role: 'teacher',
      addedAt: new Date().toISOString(),
    });
    await refreshAdminList();
  };

  const removeAdmin = async (uid: string) => {
    if (!isAdmin) throw new Error('관리자 권한이 필요합니다.');
    await deleteDoc(doc(db, 'admins', uid));
    await refreshAdminList();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        adminData,
        loading,
        adminList,
        loginWithGoogle,
        logout,
        addAdminEmail,
        removeAdmin,
        refreshAdminList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
