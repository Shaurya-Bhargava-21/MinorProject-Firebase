// components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    // Updated to handle all three roles: mentor, admin, mentee
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

export default ProtectedRoute;