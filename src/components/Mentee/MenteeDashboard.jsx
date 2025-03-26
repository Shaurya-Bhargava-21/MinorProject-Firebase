import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import './MenteeDashboard.css';

function MenteeDashboard() {
  const { currentUser, logout } = useAuth();
  const [menteeData, setMenteeData] = useState(null);
  const [mentorData, setMentorData] = useState(null);
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          // Fetch mentee data
          const menteeRef = doc(db, 'mentees', currentUser.uid);
          const menteeSnap = await getDoc(menteeRef);
          if (menteeSnap.exists()) {
            setMenteeData({ id: menteeSnap.id, ...menteeSnap.data() });
          }

          // Fetch mentor data
          if (menteeSnap.data()?.mentorId) {
            const mentorRef = doc(db, 'mentors', menteeSnap.data().mentorId);
            const mentorSnap = await getDoc(mentorRef);
            if (mentorSnap.exists()) {
              setMentorData({ id: mentorSnap.id, ...mentorSnap.data() });
            }
          }

          // Fetch leave applications
          const leaveQuery = query(
            collection(db, 'leaveApplications'),
            where('menteeId', '==', currentUser.uid)
          );
          const leaveSnap = await getDocs(leaveQuery);
          setLeaveApplications(leaveSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // Fetch chats
          const chatsQuery = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', currentUser.uid)
          );
          const chatsSnap = await getDocs(chatsQuery);
          setChats(chatsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="mentee-dashboard">
        <Navbar userName={currentUser?.name} userRole="Mentee" onLogout={logout} />
        <div className="dashboard-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mentee-dashboard">
      <Navbar userName={currentUser?.name} userRole="Mentee" onLogout={logout} />
      <div className="dashboard-container">
        <h1>My Dashboard</h1>
        
        <div className="profile-section">
          <h2>My Profile</h2>
          <div className="profile-details">
            <p><strong>Name:</strong> {menteeData?.name || 'Student Demo'}</p>
            <p><strong>Roll Number:</strong> {menteeData?.rollNumber || '2205100'}</p>
            <p><strong>Email:</strong> {currentUser?.email || 'student@example.com'}</p>
            <p><strong>Phone:</strong> {menteeData?.phone || '9876543210'}</p>
            <p><strong>Attendance:</strong> {menteeData?.attendance || '78'}%</p>
            <p><strong>Mentor Name:</strong> {mentorData?.name || 'Mentor Demo'}</p>
            <p><strong>Mentor Contact:</strong> {mentorData?.phone || '9876543210'}</p>
          </div>
        </div>
        
        <div className="leave-section">
          <h2>My Leave Applications</h2>
          <Link to="/mentee/leave-application" className="apply-btn">Apply for Leave</Link>
          
          {leaveApplications.length > 0 ? (
            <div className="leave-table">
              <div className="leave-header">
                <span>From</span>
                <span>To</span>
                <span>Reason</span>
                <span>Status</span>
              </div>
              {leaveApplications.map(app => (
                <div className="leave-row" key={app.id}>
                  <span>{app.startDate}</span>
                  <span>{app.endDate}</span>
                  <span>{app.reason || 'Family function'}</span>
                  <span className={`status ${app.status.toLowerCase()}`}>
                    {app.status || 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-leaves">No leave applications found.</p>
          )}
        </div>
        
        <div className="chat-section">
          <h2>Chat</h2>
          <p>Conversations</p>
          {chats.length > 0 ? (
            <div className="chat-list">
              {chats.map(chat => (
                <div className="chat-item" key={chat.id}>
                  Chat with {chat.participants.filter(p => p !== currentUser.uid).join(', ')}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-chats">No active conversations</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MenteeDashboard;