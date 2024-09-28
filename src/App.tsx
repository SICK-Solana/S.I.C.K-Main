import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import WhitepaperSICK from './pages/whitepaper';
import Home from './pages/home';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/whitepaper" element={<WhitepaperSICK />} />
       </Routes>
    </Router>
  );
}

export default App;