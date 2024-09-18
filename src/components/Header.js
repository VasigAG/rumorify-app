// src/components/Header.js

import React from 'react';
import './Header.css'; // Import the corresponding CSS file

const Header = () => {
  return (
    <header className="header">
      <a href="/" className="logo-link">
        <img 
          src="https://i.ibb.co/NSvxqKk/logo.png" 
          alt="Rumorify Logo" 
          className="logo" 
        />
      </a>
      <h3 className="site-title">umorify</h3>
    </header>
  );
};

export default Header;
