import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicForm, { FieldConfig } from '../form-component';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearError } from '@/store/slices/authentication/login';
import { loginUser } from '@/store/action/authentication/login';
import googleLogo from '@/assets/googleLogo.png';
import githubLogo from '@/assets/github.png';
import Loader from '../loader/loader';

interface LoginProps {
  logoSrc?: string;
  logoAlt?: string;
}

const Login: React.FC<LoginProps> = ({ logoSrc, logoAlt = 'Company Logo' }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { httpClient } = initializeHttpClient();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleCreateAccount = () => {
    navigate('/registerform');
  };

  const handleForgotPassword = () => {
    navigate('/forgotpassword');
  };

  const fields: FieldConfig[] = [
    {
      name: 'email',
      label: 'Email address',
      type: 'email',
      placeholder: 'Enter your email',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      required: true,
    },
    {
      name: 'rememberMe',
      label: 'Remember me',
      type: 'checkbox',
    },
  ];

  const handleSubmit = async (values: Record<string, string>) => {
    try {
      const result = await dispatch(
        loginUser({
          email: values.email,
          password: values.password,
          api: httpClient,
        }),
      ).unwrap();

      if (result) {
        if (values.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gray-50)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {isLoading && <Loader />}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {logoSrc && (
          <div className="flex justify-center">
            <img className="h-12 w-auto" src={logoSrc} alt={logoAlt} />
          </div>
        )}
      </div>
      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-3 shadow sm:rounded-lg sm:px-4">
          <h2 className="text-center text-2xl font-extrabold text-[var(--gray-700)]">
            Sign in to your account
          </h2>
          <p className="mb-4 text-center text-sm text-[var(--gray-600)]">
            or{' '}
            <button
              onClick={handleCreateAccount}
              className="font-medium text-[var(--button)] hover:text-[var(--button-hover)] focus:outline-none focus:underline hover:underline transition ease-in-out duration-150 cursor-pointer"
            >
              create a new account
            </button>
          </p>

          <div className="flex justify-center space-x-3 mb-4">
            <button
              type="button"
              onClick={() => {
                window.location.href = import.meta.env.VITE_GOOGLE_REQUEST_URL;
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 transition cursor-pointer"
            >
              <img src={googleLogo} alt="Google Logo" className="h-5 w-5" />
              <span className="text-sm">Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = import.meta.env.VITE_GITHUB_REQUEST_URL;
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 transition cursor-pointer"
            >
              <img src={githubLogo} alt="GitHub Logo" className="h-5 w-5" />
              <span className="text-sm">GitHub</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--gray-300)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[var(--gray-500)]">
                continue with email
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-3 bg-[var(--error-bg1)] border border-[var(--error-bg)] text-[var(--error)] rounded-md p-2 text-sm">
              {error}
            </div>
          )}

          <DynamicForm
            fields={fields}
            onSubmit={handleSubmit}
            submitText={isLoading ? 'Signing in...' : 'Sign in'}
          />

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="font-medium text-[var(--button)] hover:text-[var(--button-hover)] focus:outline-none focus:underline transition ease-in-out duration-150 cursor-pointer"
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
