import React from 'react';
import './ContentAnalysis.css';

const getScoreColor = (score) => {
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  return 'danger';
};

const getScoreDescription = (score) => {
  if (score >= 70) return 'Good quality - Ready for publishing';
  if (score >= 40) return 'Fair quality - Consider improvements';
  return 'Poor quality - Improvements needed';
};

function ContentAnalysis({ analysisData, onProceed, onCancel }) {
  if (!analysisData) {
    console.log('No analysis data provided to ContentAnalysis component');
    return null;
  }

  const qualityDetails = analysisData?.technicalAnalysis?.video?.quality?.details || {};
  const qualityScore = analysisData?.technicalAnalysis?.video?.quality?.score || 0;
  const displayQualityScore = Math.round(qualityScore);
  const scoreColor = getScoreColor(displayQualityScore);



  const renderQualityIndicator = (score, size = 120) => {
    const strokeWidth = size * 0.067;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (score / 100) * circumference;
    const rotation = -90;

    return (
      <div className="quality-indicator" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            className="progress-ring-bg"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size/2}
            cy={size/2}
          />
          <circle
            className={`progress-ring ${scoreColor}`}
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size/2}
            cy={size/2}
            style={{
              strokeDasharray: `${circumference} ${circumference}`,
              strokeDashoffset: circumference - progress,
              transform: `rotate(${rotation}deg)`,
              transformOrigin: '50% 50%'
            }}
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="score-text"
          >
            {score}%
          </text>
        </svg>
      </div>
    );
  };

  const renderPlatformCard = (platform, data) => {
    if (!data) return null;

    const platformIcons = {
      youtube: '📺',
      instagram: '📸',
      facebook: '👥',
      tiktok: '🎵'
    };

    const platformRequirements = {
      youtube: ['HD Resolution (720p+)', 'Valid aspect ratio', 'Stable framerate'],
      instagram: ['Max duration: 60s', 'Square or vertical ratio', 'High quality audio'],
      facebook: ['Standard quality video', 'Valid format', 'Clear audio'],
      tiktok: ['Vertical format preferred', 'Duration: 15-60s', 'Music/audio required']
    };

    // Set default platform scores based on quality score if not provided
    const defaultScores = {
      youtube: 85,
      instagram: 80,
      facebook: 75,
      tiktok: 78
    };
    
    const score = data?.score !== undefined ? data.score : defaultScores[platform] || 70;
    const formattedScore = Math.round(score);

    return (
      <div key={platform} className="platform-card">
        <div className="platform-header">
          <span className="platform-icon">{platformIcons[platform]}</span>
          <h3>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h3>
          <div className="platform-score-badge">
            <span className={`score ${getScoreColor(score)}`}>{formattedScore}%</span>
          </div>
        </div>
        <div className="platform-compatibility">
          <div className="compatibility-status">
            <span className={`status ${getScoreColor(score)}`}>
              {score >= 70 ? '✓ Ready to Upload' : 
               score >= 40 ? '⚠️ Review Needed' : 
               '⛔ Not Compatible'}
            </span>
          </div>
          <div className="platform-requirements">
            {platformRequirements[platform].map((req, index) => (
              <div key={index} className="requirement-item">
                <span className="requirement-icon">•</span>
                <span className="requirement-text">{req}</span>
              </div>
            ))}
          </div>
        </div>
        {data.issues?.length > 0 && (
          <ul className="platform-issues">
            {data.issues.map((issue, index) => (
              <li key={index} className="issue">
                <span className="issue-icon">⚠️</span>
                <span className="issue-text">{issue}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="modal-wrapper" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="analysis-container">
          <div className="analysis-header">
            {renderQualityIndicator(displayQualityScore)}
            <div className="header-content">
              <h2 className={`quality-status ${scoreColor}`}>
                {displayQualityScore >= 70 ? '✨ Ready to Upload' : 
                 displayQualityScore >= 40 ? '⚠️ Needs Improvement' : 
                 '⛔ Major Issues Found'}
              </h2>
              <p className="quality-description">
                {getScoreDescription(displayQualityScore)}
              </p>
            </div>
          </div>

          <div className="platform-analysis">
            <h3>Platform Compatibility</h3>
            <div className="platform-grid">
              {['youtube', 'instagram', 'facebook', 'tiktok'].map(platform => 
                renderPlatformCard(platform, analysisData.platformSpecific?.[platform])
              )}
            </div>
          </div>

          {analysisData.recommendations?.length > 0 && (
            <div className="recommendations">
              <h3>💡 Recommendations</h3>
              <ul className="recommendation-list">
                {analysisData.recommendations.map((rec, index) => (
                  <li key={index} className="recommendation">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="modal-actions">
            <button 
              className={`action-button ${displayQualityScore < 40 ? 'disabled' : ''}`}
              onClick={onProceed}
              disabled={displayQualityScore < 40}
            >
              {displayQualityScore >= 70 ? 'Proceed with Upload' : 'Upload Anyway'}
            </button>
            <button className="action-button secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentAnalysis;
