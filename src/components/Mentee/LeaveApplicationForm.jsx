// src/components/Mentee/LeaveApplicationForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMenteeByEmail, submitLeaveApplication } from '../../services/mockDataService';
import Navbar from '../common/Navbar';

function LeaveApplicationForm() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        const menteeData = await getMenteeByEmail(currentUser.email);
        if (menteeData) {
          setProfile(menteeData);
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setError('All fields are required.');
      return false;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate < startDate) {
      setError('End date cannot be before start date.');
      return false;
    }

    if (formData.reason.length < 10) {
      setError('Reason must be at least 10 characters long.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await submitLeaveApplication({
        menteeId: profile.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });
      navigate('/mentee/dashboard');
    } catch (error) {
      setError('Failed to submit application. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate('/mentee/dashboard');
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="leave-application-page">
      <Navbar userName={currentUser?.name} userRole="Mentee" onLogout={logout} />

      <div className="container">
        <button onClick={goBack} className="btn btn-back">
          ← Back to Dashboard
        </button>

        <div className="form-card">
          <h2>Apply for Leave</h2>

          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="startDate">From Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">To Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for Leave</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={4}
                placeholder="Enter the reason for your leave (minimum 10 characters)"
                required
              ></textarea>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={goBack}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LeaveApplicationForm;