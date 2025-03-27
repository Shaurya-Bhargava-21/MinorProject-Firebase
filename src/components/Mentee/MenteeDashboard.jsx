import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../common/Navbar';
import './menteeDashboard.css';

function MenteeDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [menteeData, setMenteeData] = useState(null);
  const [mentorData, setMentorData] = useState(null);
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          setError('');

          const menteeRef = doc(db, 'mentees', currentUser.uid);
          const menteeSnap = await getDoc(menteeRef);
          if (menteeSnap.exists()) {
            setMenteeData({ id: menteeSnap.id, ...menteeSnap.data() });
          } else {
            throw new Error('Mentee profile not found.');
          }

          if (menteeSnap.data().mentorId) {
            const mentorRef = doc(db, 'mentors', menteeSnap.data().mentorId);
            const mentorSnap = await getDoc(mentorRef);
            if (mentorSnap.exists()) {
              setMentorData({ id: mentorSnap.id, ...mentorSnap.data() });
            }
          }

          const leaveQuery = query(
            collection(db, 'leaveApplications'),
            where('menteeId', '==', currentUser.uid)
          );
          const leaveSnap = await getDocs(leaveQuery);
          const leaveData = leaveSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setLeaveApplications(leaveData);

          const chatsQuery = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', currentUser.uid)
          );
          const chatsSnap = await getDocs(chatsQuery);
          const chatsData = chatsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setChats(chatsData);
        } catch (error) {
          setError('Failed to load dashboard data. Please try again later.');
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [currentUser]);

  const handleApplyLeaveClick = () => {
    navigate('/mentee/leave-application');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div className="mentee-dashboard">
      <Navbar userName={currentUser?.name} userRole="Mentee" onLogout={logout} />
      <div className="dashboard-container">
        <h1>Mentee Dashboard</h1>
        {menteeData && (
          <div>
            <h2>Welcome, {menteeData.name}</h2>
            <p>Roll Number: {menteeData.rollNumber}</p>
            <p>Attendance: {menteeData.attendance}%</p>
          </div>
        )}
        {mentorData && (
          <div>
            <h3>Your Mentor</h3>
            <p>Name: {mentorData.name}</p>
            <p>Department: {mentorData.department}</p>
          </div>
        )}

        <div>
          <h3>Your Leave Applications</h3>

          <div className="leave-application-button">
            <button onClick={handleApplyLeaveClick} className="btn btn-primary">Apply for Leave</button>
          </div>
          {leaveApplications.length === 0 ? (
            <p>No leave applications.</p>
          ) : (
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveApplications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.startDate}</td>
                    <td>{app.endDate}</td>
                    <td>{app.reason}</td>
                    <td>{app.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h3>Chats</h3>
          {chats.length === 0 ? (
            <p>No chats available.</p>
          ) : (
            <ul>
              {chats.map((chat) => (
                <li key={chat.id}>
                  Chat with {chat.participants.filter((p) => p !== currentUser.uid).join(', ')}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default MenteeDashboard;