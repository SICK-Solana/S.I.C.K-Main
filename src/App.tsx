import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  // useLocation,
} from "react-router-dom";

import Home from "./pages/home";
import CrateCreator from "./pages/createcrate";
import CrateDetailPage from "./pages/crates";
import ExploreCrate from "./pages/explorecrate/ExploreCrate";
import SwapFunction from "./pages/swap";
import SickAi from './pages/sickai';
// import HeaderPhone from './components/ui/headerPhone';
import Dashboard from './pages/dashboard';

const AppContent: React.FC<{ wallets: any[] }> = ({ }) => {
  // const location = useLocation();
  // const showHeader = location.pathname !== '/';

  return (
    <>
      {/* {showHeader && <HeaderPhone wallets={wallets} />} */}
      
      <Routes>
        <Route path="/" element={<ExploreCrate />} />
          <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/explorecrate" element={<ExploreCrate />} />
        <Route path="/cratecreator" element={<CrateCreator />} />
        <Route path="/crates/:id" element={<CrateDetailPage />} />
         <Route path="/swap" element={<SwapFunction />} />
         <Route path="/sai" element={<SickAi />} />
      </Routes>
    </>
  );
};

const App: React.FC<{ wallets: any[] }> = ({ wallets }) => {
  return (
    <Router>
      <AppContent wallets={wallets} />
    </Router>
  );
};

export default App;