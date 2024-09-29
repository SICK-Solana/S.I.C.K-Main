import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import WhitepaperSICK from './pages/whitepaper';
import Home from './pages/home';
import Dashboard from './pages/dashboard';

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
}

export default App;