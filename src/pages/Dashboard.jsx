import React, { useEffect, useState } from 'react';
import { getMe } from '../api/authApi';
import UploadForm from '../components/UploadForm';
import ScheduleList from '../components/ScheduleList';
import InstagramSetup from '../components/InstagramSetup';
import TikTokSetup from '../components/TikTokSetup';

export default function Dashboard() {
  const [auth, setAuth] = useState({ authenticated: false });
  const [showInstagramSetup, setShowInstagramSetup] = useState(false);
  const [showTikTokSetup, setShowTikTokSetup] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setAuth(me);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    })();
  }, []);

  // Check location state for Instagram connection
  useEffect(() => {
    const state = window.history.state;
    if (state?.usr?.instagram) {
      setInstagramConnected(true);
      setTimeout(() => setInstagramConnected(false), 5000);
    }
    if (state?.usr?.tiktok) {
      setTiktokConnected(true);
      setTimeout(() => setTiktokConnected(false), 5000);
    }
    // Also check URL search params for redirects from OAuth callbacks
    const params = new URLSearchParams(window.location.search);
    if (params.get('instagram') === 'connected') {
      setInstagramConnected(true);
      // remove the param from the URL for cleanliness
      const url = new URL(window.location.href);
      url.searchParams.delete('instagram');
      window.history.replaceState(window.history.state, '', url.toString());
      setTimeout(() => setInstagramConnected(false), 5000);
    }
    if (params.get('google') === 'connected') {
      setGoogleConnected(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('google');
      window.history.replaceState(window.history.state, '', url.toString());
      setTimeout(() => setGoogleConnected(false), 5000);
    }
    if (params.get('tiktok') === 'connected') {
      setTiktokConnected(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('tiktok');
      window.history.replaceState(window.history.state, '', url.toString());
      setTimeout(() => setTiktokConnected(false), 5000);
    }
  }, []);

  if (!auth?.authenticated) {
    return <p>Please log in first (top-right).</p>;
  }

  return (
    <div className="dashboard">
      {instagramConnected && (
        <div className="success-message" style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>🎉 Instagram connected successfully! You can now schedule posts.</span>
          <button 
            onClick={() => setInstagramConnected(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#155724'
            }}
          >
            ×
          </button>
        </div>
      )}

      {googleConnected && (
        <div className="success-message" style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>🎉 Google account connected successfully! You can now upload.</span>
          <button 
            onClick={() => setGoogleConnected(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#155724'
            }}
          >
            ×
          </button>
        </div>
      )}

      {tiktokConnected && (
        <div className="success-message" style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>🎉 TikTok connected successfully! You can now schedule posts.</span>
          <button 
            onClick={() => setTiktokConnected(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#155724'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => setShowInstagramSetup(!showInstagramSetup)}
            className="btn-secondary"
          >
            {showInstagramSetup ? 'Hide Instagram Setup' : 'Instagram Setup'}
          </button>
          <button 
            onClick={() => setShowTikTokSetup(!showTikTokSetup)}
            className="btn-secondary"
          >
            {showTikTokSetup ? 'Hide TikTok Setup' : 'TikTok Setup'}
          </button>
        </div>
      </div>

      {showInstagramSetup && (
        <div className="instagram-setup-container">
          <InstagramSetup
            onSuccess={() => {
              alert('Instagram connected successfully!');
              setShowInstagramSetup(false);
            }}
          />
        </div>
      )}

      {showTikTokSetup && (
        <div className="tiktok-setup-container">
          <TikTokSetup
            onSuccess={() => {
              alert('TikTok connected successfully!');
              setShowTikTokSetup(false);
            }}
          />
        </div>
      )}

      <div className="youtube-section">
        <h3>Multi-Platform Management</h3>
        <div className="upload-section">
          <h4>Schedule/Upload</h4>
          <UploadForm onSuccess={() => window.location.reload()} />
        </div>

        <div className="schedule-section">
          <h4>Scheduled Videos</h4>
          <ScheduleList />
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          width: 100%;
          max-width: 2400px;  /* Significantly increased max-width */
          margin: 0 auto;
          padding: 1rem;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: rgba(14, 20, 25, 0.6);
          padding: 1.5rem 2rem;
          border-radius: 16px;
          border: 1px solid rgba(155, 200, 55, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          width: 100%;
          min-width: calc(100% - 2rem);  /* Account for padding */
        }
        
        .dashboard-header h2 {
          font-size: 2.5rem;
          color: #ffffff;
          margin: 0;
          background: linear-gradient(135deg, #9bc837, #c8d654);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }
        
        .instagram-setup-container,
        .instagram-post-container,
        .tiktok-setup-container {
          background: rgba(14, 20, 25, 0.4);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: 100%;
          min-width: calc(100% - 2rem);
        }
        
        .instagram-setup-container > *,
        .instagram-post-container > *,
        .tiktok-setup-container > * {
          width: 100%;
          max-width: none;
        }
        
        .content-grid {
          display: grid;
          gap: 2rem;
          width: 100%;
          margin: 0 auto;
          min-width: calc(100% - 2rem);
        }
        
        .youtube-section {
          background: rgba(14, 20, 25, 0.3);
          border-radius: 16px;
          padding: 2rem;
          margin: 2rem auto;
          width: 100%;
          min-width: calc(100% - 2rem);
          border: 1px solid rgba(155, 200, 55, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        .upload-section,
        .schedule-section {
          margin-bottom: 2rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          width: 100%;
          min-width: calc(100% - 2rem);
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        
        .upload-section > *,
        .schedule-section > * {
          width: 100%;
          max-width: none;
        }
        
        h3 {
          margin-bottom: 2rem;
          color: #ffffff;
          font-size: 2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 1rem;
          letter-spacing: -0.5px;
        }
        
        h3::before {
          content: '';
          display: block;
          width: 6px;
          height: 32px;
          background: linear-gradient(to bottom, #9bc837, #c8d654);
          border-radius: 3px;
        }
        
        h4 {
          margin-bottom: 1.5rem;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.4rem;
          font-weight: 500;
          letter-spacing: -0.3px;
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 500;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 180px;
          justify-content: center;
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(155, 200, 55, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 768px) {
          .dashboard {
            padding: 1rem;
            width: 100%;
          }
          
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
            padding: 1rem;
          }
          
          .dashboard-header h2 {
            font-size: 2rem;
          }
          
          .content-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .youtube-section,
          .upload-section,
          .schedule-section {
            padding: 1rem;
            margin-bottom: 1rem;
          }

          .btn-secondary {
            width: 100%;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
