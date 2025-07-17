import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GitHubAuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userDataParam = params.get('userData');

    if (userDataParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));

        const userForStorage = {
          userName: userData.username || userData.displayName || 'GitHub User',
          email: userData.email || '',
          firstName: userData.displayName?.split(' ')[0] || '',
          lastName: userData.displayName?.split(' ').slice(1).join(' ') || '',
          picture: userData.avatarUrl || '',
        };

        localStorage.setItem('user', JSON.stringify(userForStorage));
        localStorage.setItem('isAuthenticated', 'true');
        if (userData.accessToken) {
          localStorage.setItem('githubAccessToken', userData.accessToken);
        }

        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Error parsing GitHub user data:', error);
        navigate('/login', { replace: true });
      }
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
