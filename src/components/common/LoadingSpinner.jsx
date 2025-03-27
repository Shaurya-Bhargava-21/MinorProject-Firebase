// src/components/common/LoadingSpinner.jsx
import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

export default LoadingSpinner;