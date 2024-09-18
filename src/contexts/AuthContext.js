import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

// Create a context with default values
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAnonymous(user.isAnonymous);
      } else {
        setUserId(null);
        setIsAnonymous(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInAnonymously = async () => {
    try {
      await signInAnonymously(auth);
      setIsAnonymous(true);
    } catch (error) {
      setError("Error signing in anonymously: " + error.message);
      console.error("Error signing in anonymously", error);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError("Error signing in with email: " + error.message);
      console.error("Error signing in with email", error);
    }
  };

  const signUpWithEmail = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Optionally, you can save additional user info in the database here

      // If you want to redirect after signup, you can use window.location.href here
    } catch (error) {
      setError("Error signing up with email: " + error.message);
      console.error("Error signing up with email", error);
    }
  };

  return (
    <AuthContext.Provider value={{ userId, isAnonymous, signInAnonymously, signInWithEmail, signUpWithEmail, error }}>
      {loading ? <p>Loading...</p> : children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
