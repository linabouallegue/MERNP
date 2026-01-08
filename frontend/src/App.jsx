import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import RegisterCompany from './pages/RegisterCompany';
import Dashboard from './pages/Dashboard';
import InternshipsList from './pages/InternshipsList';
import InternshipDetails from './pages/InternshipDetails';
import MyApplications from './pages/MyApplications';
import CompanyApplications from './pages/CompanyApplications';
import CreateInternship from './pages/CreateInternship';
import AIAssistant from './pages/AIAssistant';
import NotFound from './pages/NotFound';

import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="main-content">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/student" element={<RegisterStudent />} />
          <Route path="/register/company" element={<RegisterCompany />} />
          <Route path="/internships" element={<InternshipsList />} />
          <Route path="/internships/:id" element={<InternshipDetails />} />

          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Routes étudiants uniquement */}
          <Route
            path="/my-applications"
            element={
              
                <MyApplications />
              
            }
          />

          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AIAssistant />
              </ProtectedRoute>
            }
          />

          {/* Routes entreprises uniquement */}
          <Route
            path="/create-internship"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CreateInternship />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applications"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyApplications />
              </ProtectedRoute>
            }
          />

          {/* Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;