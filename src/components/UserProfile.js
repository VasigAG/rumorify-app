import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { fetchUserProfile, fetchRumors, updateUserProfile } from './FirebaseService'; // Import the update function
import Leaderboard from './Leaderboard';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [rumorsCount, setRumorsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const profile = await fetchUserProfile(currentUser.uid);
          setUser(profile);

          if (profile?.selectedOrg) {
            const rumors = await fetchRumors(profile.selectedOrg);
            setRumorsCount(rumors.length);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        setIsAnonymous(currentUser.isAnonymous);
      } else {
        // Redirect to login page if not authenticated
        window.location.href = '/login';
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, []);

  const handleShowLeaderboard = () => {
    if (isAnonymous) {
      alert('The leaderboard is available only to signed-in users. Please sign in to continue.');
    } else {
      setShowLeaderboard(true);
    }
  };

  const handleCloseLeaderboard = () => {
    setShowLeaderboard(false);
  };

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    if (newUsername.trim()) {
      try {
        await updateUserProfile(user.uid, { username: newUsername });
        setUser({ ...user, username: newUsername });
        setNewUsername('');
        setError('');
      } catch (err) {
        setError('Failed to update username.');
        console.error(err);
      }
    } else {
      setError('Username cannot be empty.');
    }
  };

  if (loading) {
    return <div className="user-profile">Loading...</div>;
  }

  return (
    <div className="user-profile">
      <h1>{user?.username ? `${user.username}'s Profile` : 'Profile'}</h1>

      {isAnonymous ? (
        <p>You are logged in as an anonymous user.</p>
      ) : (
        <>
          <p>Email: {user?.email || 'No email available'}</p>
          <p>Number of Rumors Posted: {rumorsCount}</p>
          <form onSubmit={handleUsernameChange}>
            <input
              type="text"
              placeholder="New Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <button type="submit" className="btn">Change Username</button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </>
      )}

      <button className="btn" onClick={handleShowLeaderboard}>Show Leaderboard</button>

      {isAnonymous && (
        <div className="sign-in-message">
          <p>The leaderboard is only available to signed-in users. Please sign in to continue.</p>
          <button className="btn" onClick={() => window.location.href = '/login'}>Go to Sign In</button>
        </div>
      )}

      {showLeaderboard && !isAnonymous && (
        <Leaderboard 
          currentUserId={auth.currentUser.uid}
          onClose={handleCloseLeaderboard}
        />
      )}

      <button className="btn back-button" onClick={() => window.history.back()}>Back to Dashboard</button>
    </div>
  );
};

export default UserProfile;
