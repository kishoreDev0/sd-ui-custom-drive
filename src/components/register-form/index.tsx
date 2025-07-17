import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import DynamicForm, { FieldConfig } from '../form-component';
import PasswordStrengthBar from '../password-strength';
import { PASSWORD_REGEX } from '@/utils/constants';
import { initializeHttpClient } from '@/axios-setup/axios-interceptor';
import { useAppDispatch, useAppSelector } from '@/store';
import { resetRegisterState } from '@/store/slices/authentication/registerForm';
import { registerUser } from '@/store/action/authentication/registerForm';
import { Snackbar } from '../snackbar';

const RegistrationForm = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { httpClient } = initializeHttpClient();
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  const { isLoading, error } = useAppSelector((state) => state.register);

  useEffect(() => {
    return () => {
      dispatch(resetRegisterState());
    };
  }, [dispatch]);

  const newPasswordValidation = z
    .string()
    .refine((val) => PASSWORD_REGEX.test(val), {
      message:
        'Password should contain atleast 1 uppercase letter, 1 special character, and a number',
    });

  const fields: FieldConfig[] = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter first name',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter last name',
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
      name: 'phoneNumber',
      label: 'Phone Number',
      type: 'text',
      placeholder: 'Enter phone number',
      required: true,
    },
    {
      name: 'addressLine1',
      label: 'Address Line 1',
      type: 'text',
      placeholder: 'Enter address line 1',
      required: false,
    },
    {
      name: 'addressLine2',
      label: 'Address Line 2',
      type: 'text',
      placeholder: 'Enter address line 2',
      required: false,
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Enter city',
      required: false,
    },
    {
      name: 'state',
      label: 'State',
      type: 'text',
      placeholder: 'Enter state',
      required: false,
    },
    {
      name: 'country',
      label: 'Country',
      type: 'text',
      placeholder: 'Enter country',
      required: false,
    },
    {
      name: 'zipcode',
      label: 'Zipcode',
      type: 'text',
      placeholder: 'Enter zipcode',
      required: false,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter password',
      required: true,
      customValidation: newPasswordValidation,
      className: 'mb-2',
      renderAfterField: () =>
        password.length > 0 ? (
          <div className="mt-2 mb-4">
            <PasswordStrengthBar password={password} />
          </div>
        ) : null,
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Confirm password',
      required: true,
      customValidation: z
        .string()
        .refine((confirmPassword) => confirmPassword === password, {
          message: 'Passwords must match',
        }),
      className: 'mb-2',
    },
    {
      name: 'terms',
      label: 'I agree to the Terms and Privacy Policy',
      type: 'checkbox',
      required: true,
    },
  ];

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    password: '',
    confirmPassword: '',
    terms: false,
  };

  const handleFieldChange = (fieldName: string | number, value: string) => {
    if (fieldName === 'password') {
      setPassword(value);
    }
  };

  const handleSubmit = async (values: Record<string, string>) => {
    try {
      const response = await dispatch(
        registerUser({
          userData: {
            createdBy: {
              id: 1,
            },
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            password: values.password,
            addressLine1: values.addressLine1 || '',
            addressLine2: values.addressLine2 || '',
            city: values.city || '',
            state: values.state || '',
            country: values.country || '',
            zipcode: Number(values.zipcode) || 0,
            roleId: 0,
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
          navigate('/login');
        }, 3000);
      } else {
        await setSnackbar({
          message: response.message,
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Registration failed', err);
      await setSnackbar({
        message: 'Registration failed',
        type: 'error',
      });
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--gray-50)] w-full py-5">
      <div className="w-full max-w-3xl p-4 space-y-1 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-1 text-2xl font-extrabold text--[var(--gray-700)]">
            Create an account
          </h2>
          <p className="text-sm text--[var(--gray-600)]">
            Register to get started with our platform
          </p>
          {error && <p className="text--[var(--error)] mt-2">{error}</p>}
        </div>

        <DynamicForm
          fields={fields}
          onSubmit={handleSubmit}
          submitText={isLoading ? 'Registering...' : 'Register'}
          initialValues={initialValues}
          splitFields={true}
          className="max-w-3xl"
          onFieldChange={handleFieldChange}
        />

        <div className="text-center text-sm">
          <p className="text-[var(--gray-600)]">
            Already have an account?{' '}
            <button
              onClick={handleSignIn}
              className="font-medium text-[var(--button)] hover:text-[var(--button-hover)] focus:outline-none hover:underline focus:underline transition ease-in-out duration-150 cursor-pointer"
            >
              Sign in
            </button>
          </p>
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

export default RegistrationForm;
