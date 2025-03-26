// src/components/Admin/MentorList.jsx
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import './Admin.css';

function MentorList({ mentors, onMentorDeleted }) {
  const [localMentors, setLocalMentors] = useState(mentors);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocalMentors(mentors);
  }, [mentors]);

  const handleDelete = async (mentorId) => {
    if (window.confirm('Are you sure you want to delete this mentor?')) {
      try {
        setError('');
        // Delete the mentor document from Firestore
        await deleteDoc(doc(db, 'mentors', mentorId));
        setLocalMentors((prev) => prev.filter((m) => m.id !== mentorId));
        onMentorDeleted?.(mentorId);
      } catch (error) {
        setError('Failed to delete mentor. Please try again.');
        console.error('Error deleting mentor:', error);
      }
    }
  };

  return (
    <div className="mentor-management">
      {error && <div className="alert error">{error}</div>}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Mentees</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {localMentors.map((mentor) => (
              <tr key={mentor.id}>
                <td>
                  <div className="user-info">
                    <img
                      src={mentor.profileImage || 'https://placehold.co/40x40'}
                      alt={mentor.name}
                      className="avatar-sm"
                      onError={(e) => (e.target.src = 'https://placehold.co/40x40')}
                    />
                    {mentor.name}
                  </div>
                </td>
                <td>{mentor.email}</td>
                <td>{mentor.department}</td>
                <td>
                  <span className="mentee-count">
                    {mentor.mentees?.length || 'None'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-edit"
                      onClick={() => {
                        /* Edit functionality */
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(mentor.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {localMentors.length === 0 && (
          <div className="empty-state">
            <p>No mentors found. Create one using the form above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MentorList;