import { Link } from 'react-router-dom';
function Navbar({ userName, userRole, onLogout }) {
  // Determine the home route based on userRole
  const getHomeRoute = () => {
    switch (userRole.toLowerCase()) {
      case 'admin':
        return '/admin/dashboard';
      case 'mentor':
        return '/mentor/dashboard';
      case 'mentee':
        return '/mentee/dashboard';
      default:
        return '/login'; // Fallback in case role is undefined or invalid
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={getHomeRoute()}>MeantEazyy</Link>
      </div>
      
      <div className="navbar-user">
        <span className="user-info">
          <span className="user-name">{userName}</span>
          <span className="user-role">({userRole})</span>
        </span>
        <button onClick={onLogout} className="btn btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;