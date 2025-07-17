import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicForm, { FieldConfig } from '../form-component';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useAppDispatch, useAppSelector } from '@/store';
import { RootState } from '@/store/reducer';
import { forgotPassword } from '@/store/action/authentication/forgotPassword';
import { Snackbar } from '../snackbar';
import Loader from '../loader/loader';

interface ForgotPasswordProps {
  logoSrc?: string;
  logoAlt?: string;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  logoSrc,
  logoAlt = 'Company Logo',
}) => {
  const navigate = useNavigate();
  const { httpClient } = initializeHttpClient();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(
    (state: RootState) => state.forgotPassword,
  );
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  const handleBackToLogin = () => navigate('/login');

  const fields: FieldConfig[] = [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email',
      required: true,
    },
  ];

  const handleSubmit = async (values: Record<string, string>) => {
    try {
      const response = await dispatch(
        forgotPassword({
          forgotPayload: {
            email: values.email,
          },
          api: httpClient,
        }),
      ).unwrap();
      if (response?.status === 'success') {
        setSnackbar({
          message: 'Password reset email sent ! Please check your inbox.',
          type: 'success',
        });
        setTimeout(() => {
          handleBackToLogin();
        }, 3000);
      } else {
        await setSnackbar({
          message: 'Email not found',
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Forgot password failed', err);
      await setSnackbar({
        message: 'Forgot password failed',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gray-50)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {isLoading && <Loader />}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {logoSrc && (
          <div className="flex justify-center">
            <img className="h-12 w-auto" src={logoSrc} alt={logoAlt} />
          </div>
        )}
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-2 shadow rounded-lg sm:px-5">
          <h2 className="text-center text-2xl font-extrabold text-[var(--gray-700)] mb-1">
            Forgot Password
          </h2>
          <p className="mb-4 text-center text-sm text-[var(--gray-600)]">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
          {error && (
            <div className="text-center mb-4">
              <div className="rounded-md bg-[var(--error-bg1)] p-4">
                <p className="text-sm font-medium text-[var(--error)]">
                  {error}
                </p>
              </div>
            </div>
          )}
          <DynamicForm
            fields={fields}
            onSubmit={handleSubmit}
            submitText="Send Reset Link"
          />
          <div className="text-sm text-center">
            <button
              onClick={handleBackToLogin}
              className="font-medium text-[var(--button)] hover:text-[var(--button-hover)] focus:outline-none focus:underline transition ease-in-out duration-150 cursor-pointer"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
};

export default ForgotPassword;
