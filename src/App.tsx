import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import Home from './pages/home';
import WhitepaperSICK from './pages/whitepaper';
import CrateCreator from './pages/createcrate/index';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/whitepaper" element={<WhitepaperSICK />} />
        <Route path="/cratecreator" element={<CrateCreator />} />
      </Routes>
    </Router>
  );
};

export default App;
