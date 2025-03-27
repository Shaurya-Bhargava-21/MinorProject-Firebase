// src/components/Mentor/MentorDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import Navbar from '../common/Navbar';
import ChatList from '../common/ChatList';
import ChatWindow from '../common/ChatWindow';

function MentorDashboard() {
  const { currentUser, logout, userRole } = useAuth();
  const [mentees, setMentees] = useState([]);
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('mentees');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          setError('');

          // Fetch mentees for the mentor
          const menteesQuery = query(
            collection(db, 'mentees'),
            where('mentorId', '==', currentUser.uid)
          );
          const menteesSnap = await getDocs(menteesQuery);
          const menteesData = menteesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMentees(menteesData);

          // Fetch leave applications for the mentor's mentees
          if (menteesData.length > 0) {
            const menteeIds = menteesData.map((m) => m.id);
            const leaveQuery = query(
              collection(db, 'leaveApplications'),
              where('menteeId', 'in', menteeIds)
            );
            const leaveSnap = await getDocs(leaveQuery);
            const leaveData = leaveSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setLeaveApplications(leaveData);
          } else {
            setLeaveApplications([]);
          }

          // Fetch chats for the mentor
          const chatsQuery = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', currentUser.uid)
          );
          const chatsSnap = await getDocs(chatsQuery);
          const chatsData = chatsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChats(chatsData);

          // Handle chat selection from search params
          const chatWithMenteeId = searchParams.get('chatWith');
          if (chatWithMenteeId) {
            const privateChat = chatsData.find(
              (chat) =>
                chat.type === 'private' && chat.participants.includes(chatWithMenteeId)
            );
            if (privateChat) {
              setSelectedChat(privateChat);
              setActiveTab('chats');
              setSearchParams({}, { replace: true });
            }
          }
        } catch (error) {
          setError('Failed to load dashboard data. Please try again later.');
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [currentUser, userRole, searchParams, setSearchParams]);

  const handleLeaveAction = async (applicationId, status) => {
    try {
      const appRef = doc(db, 'leaveApplications', applicationId);
      await updateDoc(appRef, { status });
      setLeaveApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error('Error updating leave application:', error);
      setError('Failed to update leave application status.');
    }
  };

  const pendingApplications = leaveApplications.filter((app) => app.status === 'pending');

  const handleNotificationClick = () => {
    setActiveTab('leaves');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="mentor-dashboard">
        <Navbar userName={currentUser?.name} userRole="Mentor" onLogout={logout} />
        <div className="dashboard-container">
          <div className="alert error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mentor-dashboard">
      <Navbar userName={currentUser?.name} userRole="Mentor" onLogout={logout} />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Mentor Dashboard</h1>
          {pendingApplications.length > 0 && (
            <div
              className="notification-badge"
              onClick={handleNotificationClick}
              style={{ cursor: 'pointer' }}
            >
              {pendingApplications.length} pending leave requests
            </div>
          )}
        </div>

        <div className="tab-navigation">
          <button
            className={activeTab === 'mentees' ? 'active' : ''}
            onClick={() => setActiveTab('mentees')}
          >
            My Mentees
          </button>
          <button
            className={activeTab === 'leaves' ? 'active' : ''}
            onClick={() => setActiveTab('leaves')}
          >
            Leave Applications {pendingApplications.length > 0 && `(${pendingApplications.length})`}
          </button>
          <button
            className={activeTab === 'chats' ? 'active' : ''}
            onClick={() => setActiveTab('chats')}
          >
            Chats
          </button>
        </div>

        {activeTab === 'mentees' ? (
          <div className="mentees-list">
            <h2>My Mentees</h2>
            {mentees.length === 0 ? (
              <p>No mentees assigned yet.</p>
            ) : (
              <div className="cards-grid">
                {mentees.map((mentee) => (
                  <div key={mentee.id} className="mentee-card">
                    <h3>{mentee.name}</h3>
                    <p>
                      <strong>Roll Number:</strong> {mentee.rollNumber}
                    </p>
                    <p>
                      <strong>Attendance:</strong> {mentee.attendance}%
                    </p>
                    <Link to={`/mentor/mentee/${mentee.id}`} className="btn btn-primary">
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'leaves' ? (
          <div className="leave-applications">
            <h2>Leave Applications</h2>
            {leaveApplications.length === 0 ? (
              <p>No leave applications to display.</p>
            ) : (
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveApplications.map((application) => {
                    const mentee = mentees.find((m) => m.id === application.menteeId);
                    return (
                      <tr key={application.id}>
                        <td>{mentee?.name || 'Unknown'}</td>
                        <td>
                          {application.startDate} to {application.endDate}
                        </td>
                        <td>{application.reason}</td>
                        <td>
                          <span className={`status ${application.status}`}>
                            {application.status.charAt(0).toUpperCase() +
                              application.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {application.status === 'pending' && (
                            <div className="action-buttons">
                              <button
                                className="btn btn-success"
                                onClick={() => handleLeaveAction(application.id, 'approved')}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleLeaveAction(application.id, 'rejected')}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="chat-section">
            <h2>Chats</h2>
            <div className="chat-container">
              <ChatList
                chats={chats}
                onSelectChat={setSelectedChat}
                currentUser={currentUser}
              />
              {selectedChat ? (
                <ChatWindow selectedChat={selectedChat} currentUser={currentUser} />
              ) : (
                <div className="chat-placeholder">Select a chat to start messaging</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MentorDashboard;