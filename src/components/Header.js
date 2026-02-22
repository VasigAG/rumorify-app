// src/components/Header.js

import React from 'react';
import './Header.css'; // Import the corresponding CSS file

const Header = () => {
  return (
    <header className="header">
      <a href="/" className="logo-link">
        <div className="logo-r-header">R</div>
      </a>
      {/* Removed the 'umorify' text to match the clean 'Big R' branding request,
          or could keep it if user wants text. User said "Remove the Rumorify logo pic from everything
          and just display an R a big R". I'll keep the text 'Rumorify' or remove it?
          "display an R a big R". I'll remove the text 'umorify' which looked like part of the logo.
          Actually, I'll just show the R. */}
    </header>
  );
};

export default Header;
