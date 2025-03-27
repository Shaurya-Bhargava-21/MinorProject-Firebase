// App.jsx - Main Application Component
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import MentorDashboard from './components/Mentor/MentorDashboard';
import MenteeDashboard from './components/Mentee/MenteeDashboard';
import MenteeProfile from './components/Mentor/MenteeProfile';
import LeaveApplicationForm from './components/Mentee/LeaveApplicationForm';
import AdminDashboard from './components/Admin/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Protected route component to handle authentication
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    // Updated redirect logic to handle all three roles
    if (userRole === 'mentor') {
      return <Navigate to="/mentor/dashboard" />;
    } else if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/mentee/dashboard" />;
    }
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Mentor Routes */}
          <Route 
            path="/mentor/dashboard" 
            element={
              <ProtectedRoute requiredRole="mentor">
                <MentorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mentor/mentee/:menteeId" 
            element={
              <ProtectedRoute requiredRole="mentor">
                <MenteeProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Mentee Routes */}
          <Route 
            path="/mentee/dashboard" 
            element={
              <ProtectedRoute requiredRole="mentee">
                <MenteeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mentee/leave-application" 
            element={
              <ProtectedRoute requiredRole="mentee">
                <LeaveApplicationForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Route */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;