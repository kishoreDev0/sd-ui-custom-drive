import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import DynamicForm, { FieldConfig } from '../form-component';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useAppDispatch, useAppSelector } from '@/store';
import { resetInviteUserState } from '@/store/slices/authentication/inviteUser';
import { inviteUser } from '@/store/action/authentication/inviteUser';
import CloseIcon from '../close-icon';

interface InviteUserFormProps {
  onClose: () => void;
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { httpClient } = initializeHttpClient();

  const { isLoading, isSuccess, error } = useAppSelector(
    (state) => state.inviteUser,
  );

  useEffect(() => {
    return () => {
      dispatch(resetInviteUserState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess) {
      alert('User invitation sent successfully');
      navigate('/dashboard');
    }
  }, [isSuccess, navigate]);

  const inviteUserSchema = z.object({
    name: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    role: z.string().min(1, 'Role is required'),
  });

  const fields: FieldConfig[] = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter full name',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter email address',
      required: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'admin', label: 'Administrator' },
        { value: 'editor', label: 'Editor' },
        { value: 'viewer', label: 'Viewer' },
        { value: 'contributor', label: 'Contributor' },
      ],
      required: true,
    },
  ];

  const handleSubmit = async (values: Record<string, string>) => {
    try {
      await dispatch(
        inviteUser({
          name: values.name,
          email: values.email,
          role: values.role,
          api: httpClient,
        }),
      ).unwrap();
    } catch (err) {
      console.error('Invite user failed', err);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-md p-2 space-y-3 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <CloseIcon onClick={onClose} className="md:right-12 lg:right-12" />
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--gray-700)]">
            Invite User
          </h2>
          <p className="text-sm text-[var(--gray-600)]">
            Send an invitation to join your team
          </p>
        </div>
        {error && (
          <div className="bg-[var(--error-bg1)] border border-[var(--error-border)] text-[var(--error)] rounded-md p-3 text-sm">
            {error}
          </div>
        )}
        <DynamicForm
          fields={fields}
          onSubmit={handleSubmit}
          submitText={isLoading ? 'Sending Invitation...' : 'Send Invitation'}
          initialValues={{ name: '', email: '', role: '' }}
          customSchema={inviteUserSchema}
        />
      </div>
    </div>
  );
};

export default InviteUserForm;
