import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { getMe } from '../api/authApi';
import './LandingPage.css';

const LandingPage = () => {
  const [me, setMe] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getMe();
        setMe(profile);
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    checkAuth();
  }, []);
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="brand">
          <Logo size="large" />
        </div>
        <p className="tagline">Intelligent video Uploading, Scheduling and Mananging Across Multiple Platforms</p>
      </header>

      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Multi-Platform Support</h3>
            <p>Upload and schedule videos to YouTube, Instagram, Facebook, and TikTok with ease</p>
          </div>
          <div className="feature-card">
            <h3>One-Click Optimization</h3>
            <p>Enter your raw content title and instantly receive a fully polished package with optimized title, hashtags, and description</p>
          </div>   
          <div className="feature-card">
            <h3>Copyright Protection Check</h3>
            <p>Built-in copyright analysis safeguards you from violations by scanning your content for risky elements</p>
          </div>                 
          <div className="feature-card">         
            <h3>AI-Powered Title Optimization</h3>
            <p>Transform raw titles into highly engaging, SEO-friendly titles that boost visibility and capture audience attention</p>
          </div>
          <div className="feature-card">
            <h3>Smart Hashtag Generator</h3>
            <p>Get real-time, relevant, and trending hashtags tailored to your content for maximum reach</p>
          </div>
          <div className="feature-card">
            <h3>SEO-Optimized Descriptions</h3>
            <p>Automatically generate detailed, compelling descriptions designed to rank higher and drive engagement</p>
          </div>
          <div className="feature-card">
            <h3>Real-Time Trend Integration</h3>
            <p>Stay up-to-date with trending topics and keywords to keep your content fresh and competitive</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to streamline your video publishing?</h2>
        <div className="cta-buttons">
          {me?.authenticated ? (
            <Link to="/dashboard" className="cta-button dashboard-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm0 8h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm10 0h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm0-16v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1z" fill="currentColor"/>
              </svg>
              Go to Dashboard
            </Link>
          ) : (
            <a
              href={`https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent&scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube.channel-memberships.creator https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid')}&response_type=code&client_id=${encodeURIComponent('471581845280-19vj6o20rt21hoh95qdqs2p9ehhn7b9f.apps.googleusercontent.com')}&redirect_uri=${encodeURIComponent('https://aurixon-ai-backend.vercel.app/auth/google/callback')}`}
              className="cta-button google-btn"
            >
              <div className="google-btn-content">
                <div className="google-icon-wrapper">
                  <svg viewBox="0 0 48 48" className="google-icon">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                </div>
                <span>Sign in with Google</span>
              </div>
            </a>
          )}
        </div>
      </section>

      <footer className="landing-footer">
        <nav className="footer-links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <a href="mailto:support@aurixon.com">Contact</a>
        </nav>
        <p className="copyright">&copy; 2025 Aurixon. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
