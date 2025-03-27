// src/components/Mentee/MenteeDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../common/Navbar';

function MenteeDashboard() {
  const { currentUser, logout } = useAuth();
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

          // Fetch mentee data
          const menteeRef = doc(db, 'mentees', currentUser.uid);
          const menteeSnap = await getDoc(menteeRef);
          if (menteeSnap.exists()) {
            setMenteeData({ id: menteeSnap.id, ...menteeSnap.data() });
          } else {
            throw new Error('Mentee profile not found.');
          }

          // Fetch mentor data
          if (menteeSnap.data().mentorId) {
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
          const leaveData = leaveSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setLeaveApplications(leaveData);

          // Fetch chats
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="mentee-dashboard">
        <Navbar userName={currentUser?.name} userRole="Mentee" onLogout={logout} />
        <div className="dashboard-container">
          <div className="alert error">{error}</div>
        </div>
      </div>
    );
  }

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
          <h3>Leave Applications</h3>
          {leaveApplications.length === 0 ? (
            <p>No leave applications.</p>
          ) : (
            <ul>
              {leaveApplications.map((app) => (
                <li key={app.id}>
                  {app.startDate} to {app.endDate}: {app.status}
                </li>
              ))}
            </ul>
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