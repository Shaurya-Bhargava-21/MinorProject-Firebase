// src/components/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, userRole, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is already logged in, redirect based on their role
    if (currentUser && userRole) {
      if (userRole === 'mentor') {
        navigate('/mentor/dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'mentee') {
        navigate('/mentee/dashboard');
      }
    }
  }, [currentUser, userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Redirect is handled by the useEffect hook
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No user found with this email. Please sign up.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format. Please enter a valid email.');
      } else {
        setError('Failed to sign in. Please try again later.');
      }
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Mentor-Mentee Management System</h2>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-info">
          <p>Demo Credentials:</p>
          <ul>
            <li>Mentor: mentor@example.com / password</li>
            <li>Admin: admin@example.com / password</li>
            <li>Student: student@example.com / password</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;