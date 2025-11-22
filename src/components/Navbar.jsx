import React, { useEffect, useState } from 'react';
import { getMe, logout, loginUrl } from '../api/authApi';
import Logo from './Logo';
import './Navbar.css';

export default function Navbar() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getMe();
        setMe(profile);
      } catch {}
    })();
  }, []);

  const doLogout = async () => {
    await logout();
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Logo size="medium" />
      </div>
      <div className="nav-links">
        {me?.authenticated ? (
          <div className="user-section">
            <span className="user-email">{me.user?.email}</span>
            <button className="auth-button logout" onClick={doLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Logout
            </button>
          </div>
        ) : (
          <a href={loginUrl()} className="auth-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
            Login with Google
          </a>
        )}
      </div>
    </nav>
  );
}
