import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://aurixon-ai-backend.vercel.app';

const TikTokSetup = () => {
  const [status, setStatus] = useState({
    connected: false,
    username: '',
    loading: true,
    error: null,
    needsReconnect: false,
    reconnectReason: null
  });

  useEffect(() => {
    // Check for error in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    const tiktokConnected = urlParams.get('tiktok') === 'connected';

    if (error || errorDescription) {
      setStatus(prev => ({
        ...prev,
        error: decodeURIComponent(errorDescription || error || 'An unknown error occurred'),
        loading: false
      }));
    } else if (tiktokConnected) {
      // If we just connected, wait a bit then check status multiple times
      const checkInterval = setInterval(async () => {
        const result = await checkTikTokStatus();
        if (result.connected) {
          clearInterval(checkInterval);
        }
      }, 2000);
      
      // Stop checking after 30 seconds
      setTimeout(() => clearInterval(checkInterval), 30000);
    } else {
      checkTikTokStatus();
    }
  }, []);

  const checkTikTokStatus = async () => {
    try {
      const response = await axios.get(`${API}/tiktok/status`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('TikTok status response:', response.data); // Debug log
      
      const newStatus = {
        connected: response.data.connected,
        username: response.data.username || '',
        loading: false,
        error: null,
        needsReconnect: response.data.needsReconnect || false,
        reconnectReason: response.data.reason || null,
        currentScope: response.data.currentScope,
        requiredScope: response.data.requiredScope
      };
      
      setStatus(newStatus);
      return newStatus;
    } catch (error) {
      console.error('TikTok status error:', error); // Debug log
      setStatus({
        connected: false,
        username: '',
        loading: false,
        error: error.response?.data?.error || 'Failed to check TikTok connection status'
      });
    }
  };

  const handleConnect = () => {
    console.log('Redirecting to TikTok login...'); // Debug log
    window.location.href = `${API}/tiktok/login`;
  };

  const handleDisconnect = async () => {
    try {
      await axios.post(`${API}/tiktok/disconnect`, {}, {
        withCredentials: true
      });
      await checkTikTokStatus();
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: 'Failed to disconnect TikTok account'
      }));
    }
  };

  if (status.loading) {
    return <div>Loading TikTok connection status...</div>;
  }

  return (
    <div className="platform-setup-card">
      <div className="platform-header">
        <h3>TikTok Connection</h3>
        {status.connected && status.needsReconnect && (
          <div className="warning-notice" style={{ fontSize: '0.8em', color: '#856404', backgroundColor: '#fff3cd', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px' }}>
            Additional permissions needed. Please reconnect your TikTok account to enable video uploads.
          </div>
        )}
        {status.connected ? (
          <span className="status connected">Connected as {status.username}</span>
        ) : (
          <span className="status disconnected">Not connected</span>
        )}
      </div>

      {status.error && (
        <div className="error-message">{status.error}</div>
      )}

      <div className="platform-actions">
        {status.connected ? (
          <>
            {status.needsReconnect ? (
              <button onClick={handleConnect} className="btn-primary">
                Reconnect for Video Upload
              </button>
            ) : (
              <button onClick={handleDisconnect} className="btn-secondary">
                Disconnect TikTok
              </button>
            )}
          </>
        ) : (
          <button onClick={handleConnect} className="btn-primary">
            Connect TikTok
          </button>
        )}
      </div>

      {!status.connected && (
        <p className="platform-instructions">
          Connect your TikTok account to enable video uploads and scheduling.
        </p>
      )}
    </div>
  );
};

export default TikTokSetup;
