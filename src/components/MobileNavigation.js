import React from 'react';
import './MobileNavigation.css';

const MobileNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: '📰' },
    { id: 'post', label: 'Post', icon: '✍️' },
    { id: 'game', label: 'Game', icon: '🎲' },
    { id: 'leaderboard', label: 'Rank', icon: '🏆' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="mobile-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileNavigation;
