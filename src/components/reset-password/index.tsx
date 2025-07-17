import React, { useState } from 'react';
import { z } from 'zod';
import PasswordStrengthBar from '../password-strength';
import DynamicForm, { FieldConfig } from '../form-component';
import { PASSWORD_REGEX } from '@/utils/constants';
import { useAppDispatch, useAppSelector } from '@/store';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { resetPassword } from '@/store/action/authentication/resetPassword';
import CloseIcon from '../close-icon';
import { Snackbar } from '../snackbar';

interface ResetProps {
  onClose: () => void;
}

const ResetPassword: React.FC<ResetProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { httpClient } = initializeHttpClient();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { isLoading } = useAppSelector((state) => state.resetPassword);
  const { user } = useAppSelector((state) => state.auth);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  const newPasswordValidation = z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must contain atleast 8 characters')
    .refine((val) => PASSWORD_REGEX.test(val), {
      message:
        'Password should contain atleast 1 uppercase letter, 1 special character, and a number',
    })
    .refine((val) => val !== oldPassword, {
      message: 'Your old and new password should not be the same',
    });

  const fields: FieldConfig[] = [
    {
      name: 'oldPassword',
      label: 'Old Password',
      type: 'password',
      placeholder: 'Enter old password',
      required: true,
      className: 'space-y-1 mb-4',
      customValidation: z.string().min(1, 'Old Password is required'),
    },
    {
      name: 'newPassword',
      label: 'New Password',
      type: 'password',
      placeholder: 'Enter new password',
      required: true,
      className: 'space-y-1 mb-2',
      customValidation: newPasswordValidation,
      renderAfterField: () =>
        newPassword.length > 0 ? (
          <div className="mt-2 mb-4">
            <PasswordStrengthBar password={newPassword} />
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
        .refine((confirmPassword) => confirmPassword === newPassword, {
          message: 'Passwords must match',
        }),
    },
  ];

  const handleFieldChange = (fieldName: string, value: string) => {
    if (fieldName === 'newPassword') {
      setNewPassword(value);
    }
    if (fieldName === 'oldPassword') {
      setOldPassword(value);
    }
  };

  const handleSubmit = async (values: Record<string, string>) => {
    try {
      const response = await dispatch(
        resetPassword({
          resetPayload: {
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
            userId: user?.userId ?? 0,
          },
          api: httpClient,
        }),
      ).unwrap();
      if (response?.status === 'success') {
        setSnackbar({
          message: response.message,
          type: 'success',
        });
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        await setSnackbar({
          message: 'Your old password is wrong',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Reset password failed', error);
      await setSnackbar({
        message: 'Reset password failed',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md p-2 space-y-3 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <CloseIcon onClick={onClose} className="md:right-12 lg:right-12" />
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--label)]">
            Reset Password
          </h2>
          <p className="text-sm text-[var(--gray-600)]">
            Set your new password here
          </p>
        </div>
        <DynamicForm
          fields={fields}
          onSubmit={handleSubmit}
          submitText={isLoading ? 'Resetting Password...' : 'Reset password'}
          initialValues={{
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          onFieldChange={handleFieldChange}
        />
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

export default ResetPassword;
