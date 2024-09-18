import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // Make sure to import your Firestore db
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;
      
      // Create or update user profile in Firestore
      const userProfile = {
        email: user.email,
        username: isSignUp ? username : '', // Set username only on signup
        uid: user.uid,
        // Add other fields as needed
      };

      await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true }); // Use merge to update without overwriting

      navigate('/organization'); // Redirect after successful action
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignInAnonymously = async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Create an anonymous user profile
      const userProfile = {
        email: null, // No email for anonymous users
        username: 'Anonymous',
        uid: user.uid,
      };

      await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });

      navigate('/organization'); // Redirect after successful action
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login">
      <h1>Welcome to Rumorify. Spill Tea.</h1>
      <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={!isSignUp}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isSignUp}
        />
        {isSignUp && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</button>
        {error && <p className="error-message">{error}</p>}
        <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Login' : 'Create an account'}
        </button>
      </form>
      <button type="button" onClick={handleSignInAnonymously}>
        Continue as Anonymous
      </button>
    </div>
  );
}

export default Login;
