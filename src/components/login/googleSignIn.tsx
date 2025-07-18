import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract access token from URL hash
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    async function fetchAndStoreUserInfo(token: string) {
      try {
        const res = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: 'Bearer ' + token },
          },
        );
        if (res.ok) {
          const userInfo = await res.json();
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
      } catch (e) {
        // ignore
      }
    }
    if (accessToken) {
      localStorage.setItem('googleAccessToken', accessToken);
      fetchAndStoreUserInfo(accessToken).finally(() => {
        window.history.replaceState(null, '', window.location.pathname);
        navigate('/dashboard', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[var(--gray-50)] flex flex-col justify-center items-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[var(--gray-700)] mb-4">
          Processing Google sign-in...
        </h2>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
