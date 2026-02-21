import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { fetchRumors, fetchUserProfile, updateUserTeaScore, updateUserProfile } from './FirebaseService';
import { generateSummary } from './SummaryGenerator';
import './GuessTheBuzz.css';

const GuessTheBuzz = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [result, setResult] = useState(null);
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    const init = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const profile = await fetchUserProfile(user.uid);

      // Check if played today
      const today = new Date().toDateString();
      if (profile?.lastPlayed === today) {
        setHasPlayed(true);
        setLoading(false);
        return;
      }

      if (profile?.selectedOrg) {
        const rumors = await fetchRumors(profile.selectedOrg);

        const sorted = [...rumors].sort((a, b) => b.buzzScore - a.buzzScore);
        if (sorted.length < 2) {
             setCandidates([]);
             setLoading(false);
             return;
        }

        const topRumor = sorted[0];
        // Pick 3 other random rumors from top 10 excluding the winner
        const others = sorted.slice(1, 10).sort(() => 0.5 - Math.random()).slice(0, 3);

        // Combine and shuffle
        const gameRumors = [topRumor, ...others].sort(() => 0.5 - Math.random());
        setCandidates(gameRumors);

        // Generate summaries
        const newSummaries = {};
        for (const r of gameRumors) {
            try {
                // Check if summary exists on the rumor object (if backend stores it) or generate
                const summary = await generateSummary(r.referenceId, r);
                newSummaries[r.referenceId] = summary;
            } catch (e) {
                newSummaries[r.referenceId] = r.content.substring(0, 50) + "...";
            }
        }
        setSummaries(newSummaries);
      }
      setLoading(false);
    };

    init();
  }, []);

  const handleGuess = async (rumor) => {
    const user = auth.currentUser;
    // Find actual winner (highest buzz score in the current candidates)
    const winner = candidates.reduce((prev, current) => (prev.buzzScore > current.buzzScore) ? prev : current);

    if (rumor.referenceId === winner.referenceId) {
      setResult('win');
      await updateUserTeaScore(user.uid);
    } else {
      setResult('loss');
    }

    const today = new Date().toDateString();
    await updateUserProfile(user.uid, { lastPlayed: today });
    // Don't setHasPlayed(true) immediately so they can see the result message
  };

  if (loading) return <div className="guess-the-buzz">Loading game...</div>;

  if (hasPlayed && !result) return <div className="guess-the-buzz"><div className="game-message">You have already played today. Come back tomorrow!</div></div>;

  return (
    <div className="guess-the-buzz">
      <h2>Guess the Buzz! 🐝</h2>
      <p>Which rumor is the hottest tea today?</p>

      {result ? (
        <div className={`result ${result}`}>
          {result === 'win' ? '🎉 You guessed it! +1 Tea Score' : '❌ Wrong! Better luck next time.'}
        </div>
      ) : (
        <div className="candidates-list">
          {candidates.length > 0 ? candidates.map(rumor => (
            <button key={rumor.referenceId} className="candidate-card" onClick={() => handleGuess(rumor)}>
              {summaries[rumor.referenceId] || 'Loading...'}
            </button>
          )) : <div>Not enough rumors to play yet.</div>}
        </div>
      )}
    </div>
  );
};

export default GuessTheBuzz;
