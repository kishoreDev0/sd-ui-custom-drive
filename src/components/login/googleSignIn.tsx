import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './authState';
import Loader from '../loader/loader';

const GoogleAuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isProcessing) return;

    const processAuth = () => {
      const queryParams = new URLSearchParams(location.search);
      const userDataParam = queryParams.get('userData');

      if (!userDataParam) {
        setError('No user data provided');
        setIsProcessing(false);
        return;
      }

      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        login(userData);
        setIsProcessing(false);
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Error during authentication:', error);
        setError('Authentication failed');
        setIsProcessing(false);
      }
    };
    const timer = setTimeout(processAuth, 50);
    return () => clearTimeout(timer);
  }, [location, navigate, login, isProcessing]);

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--gray-50)] flex flex-col justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--error)]">
            Authentication Error
          </h2>
          <p className="mt-2 text-[var(--gray-600)]">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-[var(--focus)] text-white rounded hover:bg-[var(--focus)]"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <Loader text="Authentication successful. Redirecting to dashboard..." />
    );
  }
  return (
    <div className="min-h-screen bg-[var(--gray-50)] flex flex-col justify-center items-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[var(--gray-700)]">
          Authentication successful
        </h2>
        <p className="mt-2 text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
