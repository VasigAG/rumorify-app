import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import './MenuPage.css';

const MenuPage = ({ setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const tabs = [
    { id: 'game', label: 'Guess The Buzz', icon: '🎲' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="menu-page">
      <h2 className="menu-title">More Options</h2>
      <div className="menu-grid">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="menu-item"
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="menu-icon">{tab.icon}</span>
            <span className="menu-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <button className="logout-btn-menu" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default MenuPage;
