import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import Home from './pages/home';
import WhitepaperSICK from './pages/whitepaper';
import CrateCreator from './pages/createcrate/index';
import CrateDetailPage from './pages/crates/index';
import Dashboard from './pages/dashboard';
import ExploreCrate from './pages/explorecrate/ExploreCrate';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explorecrate" element={<ExploreCrate />} />
        <Route path="/whitepaper" element={<WhitepaperSICK />} />
        <Route path="/cratecreator" element={<CrateCreator />} />
        <Route path="/crates/:id" element={<CrateDetailPage />} />
      </Routes>
    </Router>
  );
};

export default App;
