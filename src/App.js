import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import OrganizationHandling from './components/OrganizationHandling';
import Dashboard from './components/Dashboard';

import UserProfile from './components/UserProfile';

import Header from './components/Header.js'; // Adjust path as needed

const App = () => {
  return (
    <Router>
      <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/organization" element={<OrganizationHandling />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="*" element={<Navigate to="/login" />} /> {/* Redirect to login for undefined routes */}
        </Routes>
      </Router>
  );
};

export default App;
