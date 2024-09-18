import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import './Leaderboard.css';

const Leaderboard = ({ currentUserId, onClose }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));

        // Filter out users without a username
        const validUsers = usersData.filter(user => user.username);

        // Calculate teaScores for each valid user
        const leaderboardData = await Promise.all(validUsers.map(async (user) => {
          const rumorsQuery = query(collection(db, 'rumors'), where('submittedBy', '==', user.id));
          const rumorsSnapshot = await getDocs(rumorsQuery);
          const userRumors = rumorsSnapshot.docs.map(doc => doc.data());

          // Calculate teaScore as the sum of buzz scores
          const teaScore = userRumors.reduce((total, rumor) => total + (rumor.buzzScore || 0), 0);

          return {
            ...user,
            teaScore
          };
        }));

        // Sort leaderboard by teaScore in descending order
        const sortedLeaderboard = leaderboardData.sort((a, b) => b.teaScore - a.teaScore);

        // Find the current user's rank, if they are in the leaderboard
        const rank = sortedLeaderboard.findIndex(user => user.id === currentUserId) + 1;
        setUserRank(rank);

        setLeaderboard(sortedLeaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [currentUserId]);

  if (loading) {
    return <div className="leaderboard">Loading...</div>;
  }

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      {leaderboard.length > 0 ? (
        <ul className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <li key={entry.id} className="leaderboard-item">
              <span className="leaderboard-rank">{index + 1}</span>
              <span className="leaderboard-name">{entry.username}</span>
              <span className="leaderboard-teascore">Tea Score: {entry.teaScore || 0}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No leaderboard data available.</p>
      )}
      {userRank && (
        <div className="user-rank">
          Your Rank: {userRank}
        </div>
      )}
      <button className="btn" onClick={onClose}>Close</button>
    </div>
  );
};

export default Leaderboard;
