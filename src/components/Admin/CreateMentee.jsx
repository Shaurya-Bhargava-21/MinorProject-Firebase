// src/components/Admin/CreateMentee.jsx
import { useState, useEffect } from 'react';
import { createMentee, getAllMentors } from '../../services/mockDataService';
import './Admin.css';

function CreateMentee({ onMenteeCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    phone: '',
    parentContact: '',
    mentorId: '',
  });
  const [mentors, setMentors] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Added success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const mentorsData = await getAllMentors();
        setMentors(mentorsData);
      } catch (error) {
        setError('Failed to fetch mentors.');
        console.error(error);
      }
    };
    fetchMentors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting || hasSubmitted) return;

    setError('');
    setSuccess('');

    const requiredFields = ['name', 'email', 'password', 'rollNumber', 'mentorId'];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setError('All fields marked with * are required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setHasSubmitted(true);
    try {
      const newMentee = await createMentee({
        ...formData,
        phone: formData.phone.toString(),
        parentContact: formData.parentContact.toString(),
      });

      onMenteeCreated(newMentee);
      setSuccess(
        `Mentee created successfully! Please create a Firebase Authentication user for ${formData.email} with the provided password in the Firebase Console.`
      );
      setFormData({
        name: '',
        email: '',
        password: '',
        rollNumber: '',
        phone: '',
        parentContact: '',
        mentorId: '',
      });
    } catch (err) {
      setError('Failed to create mentee. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setHasSubmitted(false);
    }
  };

  return (
    <div className="admin-form">
      <h3>Register New Mentee</h3>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Alice Johnson"
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="student@college.ac.in"
            required
          />
        </div>

        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="At least 6 characters"
            minLength="6"
            required
          />
        </div>

        <div className="form-group">
          <label>Roll Number *</label>
          <input
            type="text"
            value={formData.rollNumber}
            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
            placeholder="2205001"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="9876543210"
            pattern="[0-9]{10}"
            required
          />
        </div>

        <div className="form-group">
          <label>Parent Contact *</label>
          <input
            type="tel"
            value={formData.parentContact}
            onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
            placeholder="9876543211"
            pattern="[0-9]{10}"
            required
          />
        </div>

        <div className="form-group">
          <label>Assign Mentor *</label>
          <select
            value={formData.mentorId}
            onChange={(e) => setFormData({ ...formData, mentorId: e.target.value })}
            required
          >
            <option value="">Select Mentor</option>
            {mentors.map((mentor) => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.name} ({mentor.department})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || hasSubmitted}
        >
          {isSubmitting ? 'Creating...' : 'Create Mentee'}
        </button>
      </form>
    </div>
  );
}

export default CreateMentee;