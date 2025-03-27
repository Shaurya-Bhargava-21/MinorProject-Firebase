// src/components/Mentor/MenteeProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMenteeById, getLeaveApplicationsForMentee } from '../../services/mockDataService';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../common/Navbar';

function MenteeProfile() {
  const { menteeId } = useParams();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mentee, setMentee] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedMentee = await getMenteeById(menteeId);
        if (fetchedMentee) {
          setMentee(fetchedMentee);
          const applications = await getLeaveApplicationsForMentee(menteeId);
          setLeaveHistory(applications);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [menteeId]);

  const goBack = () => {
    navigate('/mentor/dashboard');
  };

  const handleChatWithMentee = () => {
    navigate(`/mentor/dashboard?chatWith=${menteeId}`);
  };

  if (loading || !mentee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <Navbar userName={currentUser?.name} userRole="Mentor" onLogout={logout} />

      <div className="container">
        <button onClick={goBack} className="btn btn-back">
          ← Back to Dashboard
        </button>

        <div className="profile-card">
          <h2>Mentee Profile</h2>

          <div className="profile-details">
            <div className="detail-row">
              <div className="detail-label">Name:</div>
              <div className="detail-value">{mentee.name}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Roll Number:</div>
              <div className="detail-value">{mentee.rollNumber}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Email:</div>
              <div className="detail-value">{mentee.email}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Phone:</div>
              <div className="detail-value">{mentee.phone}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Parent Contact:</div>
              <div className="detail-value">{mentee.parentContact}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Attendance:</div>
              <div className="detail-value">
                <div className="attendance-bar">
                  <div
                    className={`attendance-fill ${mentee.attendance < 75 ? 'low' : ''}`}
                    style={{ width: `${mentee.attendance}%` }}
                  ></div>
                </div>
                <span>{mentee.attendance}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="leave-history">
          <h3>Leave History</h3>

          {leaveHistory.length === 0 ? (
            <p>No leave applications found.</p>
          ) : (
            <table className="applications-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveHistory.map((application) => (
                  <tr key={application.id}>
                    <td>{application.startDate}</td>
                    <td>{application.endDate}</td>
                    <td>{application.reason}</td>
                    <td>{application.appliedOn}</td>
                    <td>
                      <span className={`status ${application.status}`}>
                        {application.status.charAt(0).toUpperCase() +
                          application.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="profile-actions">
          <button onClick={handleChatWithMentee} className="btn btn-primary">
            Chat with {mentee.name}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MenteeProfile;