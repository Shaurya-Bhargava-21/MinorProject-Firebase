// src/components/Admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import MentorList from './MentorList';
import MenteeList from './MenteeList';
import CreateMentor from './CreateMentor';
import CreateMentee from './CreateMentee';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Admin.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('mentors');
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch mentors from Firestore
        const mentorsSnapshot = await getDocs(collection(db, 'mentors'));
        const mentorsData = mentorsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMentors(mentorsData);

        // Fetch mentees from Firestore
        const menteesSnapshot = await getDocs(collection(db, 'mentees'));
        const menteesData = menteesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMentees(menteesData);
      } catch (err) {
        setError('Failed to load dashboard data. Some features may be unavailable.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewMentor = async (newMentor) => {
    setMentors([...mentors, newMentor]);
  };

  const handleNewMentee = async (newMentee) => {
    setMentees([...mentees, newMentee]);
  };

  const handleMentorDeleted = (mentorId) => {
    setMentors((prev) => prev.filter((mentor) => mentor.id !== mentorId));
  };

  const handleMenteeDeleted = (menteeId) => {
    setMentees((prev) => prev.filter((mentee) => mentee.id !== menteeId));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <Navbar userName={currentUser?.name || 'Admin'} userRole="Admin" onLogout={logout} />

      <div className="container">
        {error && <div className="alert error">{error}</div>}

        <div className="admin-header">
          <h1>Administration Dashboard</h1>
          <div className="admin-tabs">
            <button
              className={`tab ${activeTab === 'mentors' ? 'active' : ''}`}
              onClick={() => setActiveTab('mentors')}
            >
              Manage Mentors
            </button>
            <button
              className={`tab ${activeTab === 'mentees' ? 'active' : ''}`}
              onClick={() => setActiveTab('mentees')}
            >
              Manage Mentees
            </button>
          </div>
        </div>

        <div className="admin-content">
          {activeTab === 'mentors' ? (
            <>
              <CreateMentor onMentorCreated={handleNewMentor} />
              <MentorList mentors={mentors} onMentorDeleted={handleMentorDeleted} />
            </>
          ) : (
            <>
              <CreateMentee onMenteeCreated={handleNewMentee} />
              <MenteeList
                mentees={mentees}
                mentors={mentors} // Pass mentors to MenteeList
                onMenteeDeleted={handleMenteeDeleted}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;