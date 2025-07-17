import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import PasswordStrengthBar from '../password-strength';
import { PASSWORD_REGEX } from '@/utils/constants';
import DynamicForm, { FieldConfig } from '../form-component';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useAppDispatch, useAppSelector } from '@/store';
import { changePassword } from '@/store/action/authentication/changePassword';
import { Snackbar } from '../snackbar';
import Loader from '../loader/loader';

const ChangePassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { httpClient } = initializeHttpClient();
  const queryParams = new URLSearchParams(location.search);
  const resetToken = queryParams.get('resetToken');
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  const { isLoading } = useAppSelector((state) => state.changePassword);

  useEffect(() => {
    if (!resetToken) {
      navigate('/login');
    }
  }, [resetToken, navigate]);

  const newPasswordValidation = z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must contain atleast 8 characters')
    .refine((val) => PASSWORD_REGEX.test(val), {
      message:
        'Password should contain atleast 1 uppercase letter, 1 special character, and a number',
    });

  const fields: FieldConfig[] = [
    {
      name: 'newPassword',
      label: 'New Password',
      type: 'password',
      placeholder: 'Enter new password',
      required: true,
      className: 'mb-2',
      customValidation: newPasswordValidation,
      renderAfterField: () =>
        password.length > 0 ? (
          <div className="mt-2 mb-4">
            <PasswordStrengthBar password={password} />
          </div>
        ) : null,
    },
    {
      name: 'confirmPassword',
      label: 'Confirm New Password',
      type: 'password',
      placeholder: 'Re-enter new password',
      required: true,
      className: 'mt-6 mb-8',
      customValidation: z
        .string()
        .refine((confirmPassword) => confirmPassword === password, {
          message: 'Passwords must match',
        }),
    },
  ];

  const handleFieldChange = (fieldName: string, value: string) => {
    if (fieldName === 'newPassword') {
      setPassword(value);
    }
  };

  const handleSubmit = async (values: Record<string, string>) => {
    if (!resetToken) {
      setSnackbar({ message: 'Invalid or missing reset token', type: 'error' });
      return;
    }

    try {
      const response = await dispatch(
        changePassword({
          newPassword: values.newPassword,
          resetToken,
          api: httpClient,
        }),
      ).unwrap();
      if (response?.status === 'success') {
        setSnackbar({
          message: response.message,
          type: 'success',
        });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        await setSnackbar({
          message: 'Failed to change password. Please try again.',
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Change password failed', err);
      setSnackbar({
        message: 'Failed to change password. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--gray-100)]">
      {isLoading && <Loader />}
      <div className="bg-white p-6 rounded-lg shadow-lg sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-2xl font-extrabold text-center mb-4 text-[var(--label)]">
          Change Password
        </h2>

        <div className="space-y-4">
          <DynamicForm
            fields={fields}
            onSubmit={handleSubmit}
            submitText={isLoading ? 'Changing Password...' : 'Change password'}
            initialValues={{ newPassword: '', confirmPassword: '' }}
            onFieldChange={handleFieldChange}
          />
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

export default ChangePassword;
