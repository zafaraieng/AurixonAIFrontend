import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import LandingPage from './pages/LandingPage.jsx';
import TitleOptimizer from './components/TitleOptimizer.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<LandingPage />} />
  <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
  {/* Removed duplicate Navigate route — Dashboard will read URL search params directly */}
      </Route>
    </Routes>
  </BrowserRouter>
);
