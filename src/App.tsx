import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
} from "react-router-dom";
import Landing from "./pages/landing";
import WhitepaperSICK from "./pages/whitepaper";
import Home from "./pages/home";
import CrateCreator from "./pages/createcrate";
import CrateDetailPage from "./pages/crates";
import ExploreCrate from "./pages/explorecrate/ExploreCrate";
import Graphtest from "./pages/graphtest";
import SickAi from "./pages/sickai";
import SwapFunction from "./pages/swap";
import ProtectedLayout from "./layout/Protected";
import HeaderPhone from './components/ui/headerPhone';
import { BuildType, OktoProvider } from 'okto-sdk-react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const AppContent: React.FC<{ wallets: any[] }> = ({ wallets }) => {
  const location = useLocation();
  const showHeader = location.pathname !== '/';

  return (
    <>
      {showHeader && <HeaderPhone wallets={wallets} />}
      <OktoProvider apiKey="fa869b62-94fc-4afb-8dda-a8507fed097a"  buildType={BuildType.SANDBOX}>
      <GoogleOAuthProvider clientId="501015698849-8a0bh2sdvq8fr1uksock9arqlbo37rp2.apps.googleusercontent.com">
      
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<ProtectedLayout><Outlet /></ProtectedLayout>}>
          <Route path="/dashboard" element={<Home />} />
        </Route>
        <Route path="/home" element={<Home />} />
        <Route path="/explorecrate" element={<ExploreCrate />} />
        <Route path="/whitepaper" element={<WhitepaperSICK />} />
        <Route path="/cratecreator" element={<CrateCreator />} />
        <Route path="/crates/:id" element={<CrateDetailPage />} />
        <Route path="/graphtest/:id" element={<Graphtest />} />
        <Route path="/sai" element={<SickAi />} />
        <Route path="/swap" element={<SwapFunction />} />
      </Routes>
      </GoogleOAuthProvider>
      </OktoProvider>
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