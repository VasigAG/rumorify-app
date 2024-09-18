// src/components/RumorSubmission.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { addNewRumor, updateExistingRumor, updateUserTeaScore, fetchRumors } from './FirebaseService';
import { classifyRumor } from './RumorClassification';
import { generateSummary } from './SummaryGenerator';
import './RumorSubmission.css';

function RumorSubmission({ userProfile, selectedOrg, rumors, setRumors, setSummaries }) {
  const [newRumorContent, setNewRumorContent] = useState('');

  const handleSubmitRumor = async (e) => {
    e.preventDefault();
    if (selectedOrg && newRumorContent) {
      const existingRumors = rumors.flatMap(rumor => [
        rumor,
        ...rumor.variations || [],
        ...rumor.similarSubmissions || []
      ]);
      const rumorDetails = classifyRumor(newRumorContent, existingRumors);
      const { type, referenceId, existingRumorId } = rumorDetails;

      const newRumor = {
        content: newRumorContent,
        submittedBy: auth.currentUser.uid,
        organization: selectedOrg,
        timestamp: new Date(),
        isVariation: type !== 'new',
        referenceId: referenceId,
        buzzScore: 1,
        variationType: type
      };

      // Add new rumor to Firestore
      const newRumorRef = await addNewRumor(newRumor);

      if (type !== 'new') {
        // Update the existing rumor
        await updateExistingRumor(existingRumorId, newRumor);
      }

      // Update user's tea score
      await updateUserTeaScore(auth.currentUser.uid);

      setNewRumorContent('');

      // Fetch updated rumors and update state
      const updatedRumors = await fetchRumors(selectedOrg);
      setRumors(updatedRumors);

      // Update summaries
      const newSummary = await generateSummary(referenceId, updatedRumors.find(r => r.referenceId === referenceId));
      setSummaries(prevSummaries => ({
        ...prevSummaries,
        [referenceId]: newSummary
      }));
    }
  };

  return (
    <section className="submit-rumor-section">
      <form onSubmit={handleSubmitRumor}>
        <textarea
          className="rumor-textarea"
          placeholder="What's the Tea!?"
          value={newRumorContent}
          onChange={(e) => setNewRumorContent(e.target.value)}
        />
        <button className="btn-submit" type="submit">Submit rumor</button>
      </form>
    </section>
  );
}

export default RumorSubmission;
