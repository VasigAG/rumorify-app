import React from 'react';
import './TopNavigation.css';

const TopNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: '📰' },
    { id: 'post', label: 'Post', icon: '✍️' },
    { id: 'menu', label: 'Menu', icon: '☰' }, // Replaces Post/Game/Profile
  ];

  return (
    <nav className="top-nav">
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

export default TopNavigation;
