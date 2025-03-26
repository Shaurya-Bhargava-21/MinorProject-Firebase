// src/components/Admin/MenteeList.jsx
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import './Admin.css';

function MenteeList({ mentees, mentors, onMenteeDeleted }) {
  const [localMentees, setLocalMentees] = useState(mentees);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocalMentees(mentees);
  }, [mentees]);

  const handleDelete = async (menteeId) => {
    if (window.confirm('Delete mentee and all associated data?')) {
      try {
        setError('');
        // Delete the mentee document from Firestore
        await deleteDoc(doc(db, 'mentees', menteeId));
        setLocalMentees((prev) => prev.filter((m) => m.id !== menteeId));
        onMenteeDeleted?.(menteeId);
      } catch (error) {
        setError('Failed to delete mentee. Please try again.');
        console.error('Error deleting mentee:', error);
      }
    }
  };

  // Helper function to find mentor by ID
  const getMentorById = (mentorId) => {
    return mentors.find((mentor) => mentor.id === mentorId);
  };

  return (
    <div className="mentee-management">
      {error && <div className="alert error">{error}</div>}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll Number</th>
              <th>Mentor</th>
              <th>Attendance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {localMentees.map((mentee) => {
              const mentor = getMentorById(mentee.mentorId);
              return (
                <tr key={mentee.id}>
                  <td>
                    <div className="user-info">
                      <img
                        src={mentee.profileImage || 'https://placehold.co/40x40'}
                        alt={mentee.name}
                        className="avatar-sm"
                        onError={(e) => (e.target.src = 'https://placehold.co/40x40')}
                      />
                      <div>
                        <div className="user-name">{mentee.name}</div>
                        <div className="user-email">{mentee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{mentee.rollNumber}</td>
                  <td>
                    {mentor ? (
                      <div className="mentor-info">
                        <span className="mentor-name">{mentor.name}</span>
                        <span className="mentor-dept">{mentor.department}</span>
                      </div>
                    ) : (
                      'Unassigned'
                    )}
                  </td>
                  <td>
                    <div className="attendance-tracker">
                      <div className="attendance-bar">
                        <div
                          className={`attendance-progress ${
                            mentee.attendance < 75 ? 'warning' : ''
                          }`}
                          style={{ width: `${mentee.attendance}%` }}
                        ></div>
                      </div>
                      <span className="attendance-percent">
                        {mentee.attendance}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-edit"
                        onClick={() => {
                          /* Edit implementation */
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(mentee.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {localMentees.length === 0 && (
          <div className="empty-state">
            <p>No mentees found. Register new mentees using the form above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenteeList;