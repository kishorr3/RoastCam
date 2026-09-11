import React, { useEffect, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LabPage } from './components/LabPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'lab'>('landing');

  // Sync with browser hash routing for natural navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/lab' || hash === '#lab') {
        setCurrentPage('lab');
      } else {
        setCurrentPage('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToLab = () => {
    window.location.hash = '#/lab';
    setCurrentPage('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLanding = () => {
    window.location.hash = '#/';
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main id="roastcam-app" className="min-h-screen bg-[#242424]">
      {currentPage === 'landing' ? (
        <LandingPage onStartExperience={navigateToLab} />
      ) : (
        <LabPage onBackToHome={navigateToLanding} />
      )}
    </main>
  );
}

