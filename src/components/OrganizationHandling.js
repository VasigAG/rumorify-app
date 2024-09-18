import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './OrganizationHandling.css'; // Import the CSS file

function OrganizationHandling() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'organizations'));
        const orgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrganizations(orgs);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations.');
      }
    };

    fetchOrganizations();
  }, []);

  const handleOrgSelect = async () => {
    if (selectedOrg) {
      const user = auth.currentUser;
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid), { selectedOrg }, { merge: true });
          navigate('/dashboard');
        } catch (err) {
          console.error('Error updating user data:', err);
          setError('Failed to select organization.');
        }
      } else {
        setError('User is not authenticated.');
      }
    } else {
      setError('Please select an organization.');
    }
  };

  const handleAddOrg = async () => {
    if (newOrgName) {
      try {
        await addDoc(collection(db, 'organizations'), { name: newOrgName });
        setNewOrgName('');
        // Refresh organizations list
        const querySnapshot = await getDocs(collection(db, 'organizations'));
        const updatedOrgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrganizations(updatedOrgs);
      } catch (err) {
        console.error('Error adding new organization:', err);
        setError('Failed to add new organization.');
      }
    } else {
      setError('Organization name cannot be empty.');
    }
  };

  return (
    <div className="organization-handling">
      <h2 className="section-title">Select Organizations</h2>
      
      <div className="organization-select">
        <h3 className="subsection-title">Select an Organization</h3>
        <select
          className="organization-select-box"
          onChange={(e) => setSelectedOrg(e.target.value)}
          value={selectedOrg}
        >
          <option value="">Select an organization</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.name}>{org.name}</option>
          ))}
        </select>
        <button className="btn" onClick={handleOrgSelect}>Go to Dashboard</button>
        {error && <p className="error-message">{error}</p>}
      </div>
      
      <div className="organization-add">
        <h3 className="subsection-title">Add New Organization</h3>
        <input
          className="organization-input"
          type="text"
          placeholder="New organization name"
          value={newOrgName}
          onChange={(e) => setNewOrgName(e.target.value)}
        />
        <button className="btn" onClick={handleAddOrg}>Add Organization</button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default OrganizationHandling;
