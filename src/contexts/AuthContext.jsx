// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && user.uid) {
        try {
          // Check cached role first
          const cachedRole = localStorage.getItem(`userRole_${user.uid}`);
          if (cachedRole) {
            setUserRole(cachedRole);
            const cachedName = localStorage.getItem(`userName_${user.uid}`);
            setCurrentUser({ ...user, name: cachedName || user.displayName });
          }

          // Fetch role from Firestore
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            setUserRole('admin');
            setCurrentUser({ ...user, name: adminDoc.data().name });
            localStorage.setItem(`userRole_${user.uid}`, 'admin');
            localStorage.setItem(`userName_${user.uid}`, adminDoc.data().name);
          } else {
            const mentorDoc = await getDoc(doc(db, 'mentors', user.uid));
            if (mentorDoc.exists()) {
              setUserRole('mentor');
              setCurrentUser({ ...user, name: mentorDoc.data().name });
              localStorage.setItem(`userRole_${user.uid}`, 'mentor');
              localStorage.setItem(`userName_${user.uid}`, mentorDoc.data().name);
            } else {
              const menteeDoc = await getDoc(doc(db, 'mentees', user.uid));
              if (menteeDoc.exists()) {
                setUserRole('mentee');
                setCurrentUser({ ...user, name: menteeDoc.data().name });
                localStorage.setItem(`userRole_${user.uid}`, 'mentee');
                localStorage.setItem(`userName_${user.uid}`, menteeDoc.data().name);
              } else {
                setUserRole(null);
                localStorage.removeItem(`userRole_${user.uid}`);
                localStorage.removeItem(`userName_${user.uid}`);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          if (error.code === 'unavailable') {
            // Use cached role if available
            const cachedRole = localStorage.getItem(`userRole_${user.uid}`);
            setUserRole(cachedRole || null);
            const cachedName = localStorage.getItem(`userName_${user.uid}`);
            setCurrentUser({ ...user, name: cachedName || user.displayName });
          } else {
            throw error;
          }
        }
      } else {
        setUserRole(null);
        if (user && user.uid) {
          localStorage.removeItem(`userRole_${user.uid}`);
          localStorage.removeItem(`userName_${user.uid}`);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 

export default AuthContext.jsx;