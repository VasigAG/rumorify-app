import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { fetchUserProfile, fetchRumors } from './FirebaseService';
import RumorSubmission from './RumorSubmission';
import RumorList from './RumorList';
import TopNavigation from './TopNavigation';
import UserProfile from './UserProfile';
import Leaderboard from './Leaderboard';
import GuessTheBuzz from './GuessTheBuzz';
import MenuPage from './MenuPage';
import './Dashboard.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('feed');
  const [rumors, setRumors] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [summaries, setSummaries] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [userStatus, setUserStatus] = useState('');

  const navigate = useNavigate();

  // Swipe state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Min swipe distance
  const minSwipeDistance = 50;

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
  }, [activeTab]); // Reload when tab changes might be good to refresh data, or just on mount.
  // Actually, refreshing on tab change ensures up to date data.

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/'); // Navigate to the login page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const tabs = ['feed', 'post', 'menu'];
    const currentIndex = tabs.indexOf(activeTab);

    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <RumorList
            rumors={rumors}
            setRumors={setRumors}
            selectedOrg={selectedOrg}
            summaries={summaries}
            setSummaries={setSummaries}
          />
        );
      case 'post':
        return (
          <RumorSubmission
            userProfile={userProfile}
            selectedOrg={selectedOrg}
            rumors={rumors}
            setRumors={setRumors}
            setSummaries={setSummaries}
          />
        );
      case 'menu':
        return <MenuPage setActiveTab={setActiveTab} />;
      case 'game':
        return <GuessTheBuzz />;
      case 'leaderboard':
        return (
          <Leaderboard
            currentUserId={auth.currentUser?.uid}
            onClose={() => setActiveTab('menu')}
          />
        );
      case 'profile':
        return <UserProfile />;
      default:
        return (
          <RumorList
            rumors={rumors}
            setRumors={setRumors}
            selectedOrg={selectedOrg}
            summaries={summaries}
            setSummaries={setSummaries}
          />
        );
    }
  };

  return (
    <div
      className="dashboard"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <header className="dashboard-header">
        <div className="logo-r">R</div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <TopNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="content-area">
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;
