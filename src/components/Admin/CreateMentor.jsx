// src/components/Admin/CreateMentor.jsx
import { useState } from 'react';
import { createMentor } from '../../services/mockDataService';
import './Admin.css';

function CreateMentor({ onMentorCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Added success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting || hasSubmitted) return;

    setError('');
    setSuccess('');

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.department ||
      !formData.phone
    ) {
      setError('All fields are required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('Phone number must be a 10-digit number');
      return;
    }

    setIsSubmitting(true);
    setHasSubmitted(true);
    try {
      console.log('formData', formData);
      const newMentor = await createMentor(formData);
      onMentorCreated(newMentor);
      setSuccess(
        `Mentor created successfully! Please create a Firebase Authentication user for ${formData.email} with the provided password in the Firebase Console.`
      );
      setFormData({ name: '', email: '', password: '', department: '', phone: '' });
    } catch (err) {
      setError('Failed to create mentor. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setHasSubmitted(false);
    }
  };

  return (
    <div className="admin-form">
      <h3>Register New Mentor</h3>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Dr. John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john.doe@college.edu"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Create password"
            required
          />
        </div>

        <div className="form-group">
          <label>Department</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
          >
            <option value="">Select Department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="9876543210"
            pattern="[0-9]{10}"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || hasSubmitted}
        >
          {isSubmitting ? 'Creating...' : 'Create Mentor'}
        </button>
      </form>
    </div>
  );
}

export default CreateMentor;