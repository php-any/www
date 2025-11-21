import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Docs from './pages/Docs';
import Playground from './pages/Playground';
import Showcase from './pages/Showcase';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Router>
        <div className="bg-origami-bg text-origami-text min-h-screen selection:bg-origami-cyan selection:text-black font-sans">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;