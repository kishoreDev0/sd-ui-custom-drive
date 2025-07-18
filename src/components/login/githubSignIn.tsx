import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GitHubAuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');
    if (accessToken) {
      localStorage.setItem('githubAccessToken', accessToken);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
        <p className="text-gray-600">Completing GitHub authentication...</p>
      </div>
    </div>
  );
};

export default GitHubAuthSuccess;
