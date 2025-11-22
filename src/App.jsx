import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';

export default function App() {
  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '2400px', width: '90%', margin: '20px auto', padding: 16 }}>
        <Outlet />
      </div>
    </div>
  );
}
