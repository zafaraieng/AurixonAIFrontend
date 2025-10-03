import React, { useState, useEffect } from 'react';
import { getInstagramStatus, refreshInstagramToken, disconnectInstagram } from '../api/instagramApi';

export default function InstagramSetup({ onSuccess }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await getInstagramStatus();
      setStatus(response);
      setError('');
    } catch (err) {
      setError(err?.message || 'Failed to check Instagram status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to backend OAuth endpoint
  const API = import.meta.env.VITE_API_URL || 'https://aurixon-ai-backend.vercel.app';
    window.location.href = `${API}/instagram/facebook/login`;
  };

  const handleRefreshToken = async () => {
    try {
      setRefreshing(true);
      await refreshInstagramToken();
      await checkStatus(); // Refresh status
      setError('');
    } catch (err) {
      setError(err?.message || 'Failed to refresh token');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await disconnectInstagram();
      setStatus(null);
      setError('');
      onSuccess?.();
    } catch (err) {
      setError(err?.message || 'Failed to disconnect Instagram');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="instagram-box glass-card">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="loading-spinner"></div>
          <div>Checking Instagram status...</div>
        </div>
      </div>
    );
  }

  if (status?.connected) {
    return (
      <div className="instagram-box glass-card">
        <div style={{ marginLeft: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#e0e4efff' }}>Instagram Connected</div>
              <div className="ig-status">
                Connected to: {status.pageName}
                {status.daysUntilExpiry > 0 && (
                  <span style={{ color: status.needsRefresh ? '#ff6b6b' : '#51cf66' }}>
                    {' '}(Token expires in {status.daysUntilExpiry} days)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#adb5bd', marginBottom: 8 }}>
              Account ID: {status.accountId}
            </div>
            <div style={{ fontSize: 14, color: '#adb5bd', marginBottom: 8 }}>
              Connected: {new Date(status.connectedAt).toLocaleDateString()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {status.needsRefresh && (
              <button 
                onClick={handleRefreshToken} 
                className="btn-secondary" 
                disabled={refreshing}
                style={{ flex: 1 }}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Token'}
              </button>
            )}
            <button 
              onClick={handleDisconnect} 
              className="btn-danger" 
              disabled={disconnecting}
              style={{ flex: 1 }}
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>

          {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="instagram-box glass-card">
      <div style={{ marginLeft: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#e0e4efff' }}>Instagram</div>
            <div className="ig-status">Connect your Instagram Business account to schedule posts</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: '#adb5bd', marginBottom: 8 }}>
            • Must have Instagram Business account linked to Facebook Page
          </div>
          <div style={{ fontSize: 14, color: '#adb5bd', marginBottom: 8 }}>
            • Secure OAuth connection (no passwords stored)
          </div>
          <div style={{ fontSize: 14, color: '#adb5bd', marginBottom: 8 }}>
            • Schedule posts with captions and media
          </div>
        </div>

        <button onClick={handleConnect} className="btn-primary" style={{ width: '100%' }}>
          Connect Instagram Account
        </button>

        {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}