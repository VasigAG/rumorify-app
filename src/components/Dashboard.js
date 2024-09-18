import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { fetchUserProfile, fetchRumors } from './FirebaseService';
import RumorSubmission from './RumorSubmission';
import RumorList from './RumorList';
import './Dashboard.css';

function Dashboard() {
  const [rumors, setRumors] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [userStatus, setUserStatus] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadUserAndRumors = async () => {
      const user = auth.currentUser;
      if (user) {
        // Set user status based on authentication method
        const status = user.isAnonymous ? 'Anonymous' : 'Authenticated';
        setUserStatus(status);

        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
        setSelectedOrg(profile?.selectedOrg || '');

        if (profile?.selectedOrg) {
          const fetchedRumors = await fetchRumors(profile.selectedOrg);
          setRumors(fetchedRumors);
        }
      }
    };

    loadUserAndRumors();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/'); // Navigate to the login page
    } catch (error) {
      console.error('Error signing out:', error);
      // Handle error if necessary, e.g., display an error message
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <button className="nav-button" onClick={() => navigate('/organization')}>Manage organizations</button>
        <button className="nav-button" onClick={() => navigate('/user')}>User profile</button>
        <button className="nav-button" onClick={handleLogout}>Logout</button> {/* Logout button */}
      </nav>

      <h2 className="dashboard-title">Your Dashboard</h2>

      {/* Display user status */}
      <p className="user-status">
        You are logged in as: <strong>{userProfile?.username || 'Anonymous'}</strong>
      </p>

      {/* Submit a new rumor section at the top */}
      <RumorSubmission 
        userProfile={userProfile}
        selectedOrg={selectedOrg}
        rumors={rumors}
        setRumors={setRumors}
        setSummaries={setSummaries}
      />

      {/* Rumor feed below the submission section */}
      <RumorList 
        rumors={rumors} 
        selectedOrg={selectedOrg} 
        summaries={summaries} 
        setSummaries={setSummaries}
      />
    </div>
  );
}

export default Dashboard;
