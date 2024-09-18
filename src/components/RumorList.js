import React, { useState, useEffect } from 'react';
import { generateSummary } from './SummaryGenerator'; // Ensure the path is correct
import './RumorList.css'; // Ensure this is included at the top of your component file

function RumorList({ rumors, selectedOrg, summaries, setSummaries }) {
  const [expandedRumor, setExpandedRumor] = useState(null);
  const [showAllSubmissions, setShowAllSubmissions] = useState(null);
  const [errorMessages, setErrorMessages] = useState({}); // Track errors

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchSummaries = async () => {
      const newSummaries = {};
      const newErrorMessages = {};

      for (const rumor of rumors) {
        try {
          // Check if the summary is already generated
          if (!summaries[rumor.referenceId]) {
            const summary = await generateSummary(rumor.referenceId, rumor);
            newSummaries[rumor.referenceId] = summary;
          }
        } catch (error) {
          console.error(`Error generating summary for ${rumor.referenceId}:`, error);
          newErrorMessages[rumor.referenceId] = `Failed to generate summary: ${error.message}`;
        }
      }

      setSummaries(prevSummaries => ({ ...prevSummaries, ...newSummaries }));
      setErrorMessages(newErrorMessages);
    };

    if (rumors.length > 0) {
      fetchSummaries();
    }
  }, [rumors, summaries, setSummaries]);

  const handleExpand = (id) => {
    setExpandedRumor(expandedRumor === id ? null : id);
    setShowAllSubmissions(null);
  };

  const handleShowAllSubmissions = (id) => {
    setShowAllSubmissions(showAllSubmissions === id ? null : id);
    setExpandedRumor(null);
  };

  // Sort rumors by buzzScore in descending order
  const sortedRumors = [...rumors].sort((a, b) => b.buzzScore - a.buzzScore);

  // Determine the total pages
  const totalPages = Math.ceil(sortedRumors.length / itemsPerPage);

  // Get current items for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRumors = sortedRumors.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="rumor-list-section">

      <ul className="rumor-list">
        {currentRumors.length > 0 ? (
          currentRumors.map((rumor) => (
            <li key={rumor.referenceId} className="rumor-item">
              <h3 className="rumor-title">
                {summaries[rumor.referenceId] ? (
                  summaries[rumor.referenceId]
                ) : (
                  <span className="loading-summary">
                    {errorMessages[rumor.referenceId] || 'Generating summary...'}
                  </span>
                )}
              </h3>
              <div className="rumor-buttons">
                <button className="btn" onClick={() => handleExpand(rumor.referenceId)}>
                  {expandedRumor === rumor.referenceId ? 'Hide Variations' : 'Show Variations'}
                </button>
                <button className="btn" onClick={() => handleShowAllSubmissions(rumor.referenceId)}>
                  {showAllSubmissions === rumor.referenceId ? 'Hide All Submissions' : 'Show All Submissions'}
                </button>
              </div>

              {/* Move buzz score here */}
              <span className="buzz-score">Buzz Score: {rumor.buzzScore} 🔥</span>

              {expandedRumor === rumor.referenceId && (
                <div className="rumor-variations">
                  <h4 className="variation-title">Variations</h4>
                  <ul>
                    {rumor.variations?.map((variation, idx) => (
                      <li key={idx}>
                        <strong>{variation.content}</strong> - Variation Type: {variation.variationType}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showAllSubmissions === rumor.referenceId && (
                <div className="rumor-submissions">
                  <h4 className="submission-title">All Submissions</h4>
                  <ul>
                    {/* Combine original, variations, and similar submissions */}
                    {[rumor, ...(rumor.variations || []), ...(rumor.similarSubmissions || [])].reduce((acc, submission) => {
                      // Only add unique submissions based on content
                      if (!acc.some(s => s.content === submission.content)) {
                        acc.push(submission);
                      }
                      return acc;
                    }, []).map((submission, idx) => (
                      <li key={idx}>
                        <strong>{submission.content}</strong> - Buzz Score: {submission.buzzScore} 🔥
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))
        ) : (
          <li>No rumors available.</li>
        )}
      </ul>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button 
          className="btn" 
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages} </span>
        <button 
          className="btn" 
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default RumorList;
