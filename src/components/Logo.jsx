import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium' }) => {
  const sizeClass = `logo-${size}`;
  
  return (
    <div className={`logo-container ${sizeClass}`}>
      <img 
        src="/aurixon-logo.png" 
        alt="Aurixon" 
        className="logo-image"
      />
      <span className="logo-text">Aurixon</span>
    </div>
  );
};

export default Logo;
