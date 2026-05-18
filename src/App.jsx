import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResourcesPage from './pages/ResourcesPage';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import HrdDashboard from './pages/HrdDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/dashboard" element={<JobSeekerDashboard />} />
        <Route path="/hrd-dashboard" element={<HrdDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
