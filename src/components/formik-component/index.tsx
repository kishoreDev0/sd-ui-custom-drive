import { useFormik, FormikConfig } from 'formik';
import * as Yup from 'yup';
import React from 'react';
import FormikErrorDisplay from './formik-display';

interface FormikProps<Values> extends FormikConfig<Values> {
  validationSchema?: Yup.ObjectSchema<object>;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  validateOnMount?: boolean;
}

const FormikFunction = <Values extends Record<string, unknown>>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnBlur = true,
  validateOnChange = true,
  validateOnMount = false,
}: FormikProps<Values>) => {
  const [formError, setFormError] = React.useState<string>('');

  const formik = useFormik<Values>({
    initialValues,
    validationSchema: validationSchema || Yup.object(),
    onSubmit: async (values, helpers) => {
      setFormError('');
      try {
        await onSubmit(values, helpers);
      } catch (error) {
        if (error instanceof Error) {
          setFormError(error.message);
        } else if (typeof error === 'string') {
          setFormError(error);
        } else {
          setFormError('An unexpected error occurred');
        }
      }
    },
    validateOnBlur,
    validateOnChange,
    validateOnMount,
  });

  const ErrorDisplay = ({ className = '' }: { className?: string }) => (
    <FormikErrorDisplay error={formError} className={className} />
  );

  return {
    values: formik.values,
    errors: formik.errors,
    touched: formik.touched,
    handleChange: formik.handleChange,
    handleBlur: formik.handleBlur,
    handleSubmit: formik.handleSubmit,
    setFieldValue: formik.setFieldValue,
    setFieldTouched: formik.setFieldTouched,
    resetForm: formik.resetForm,
    isSubmitting: formik.isSubmitting,
    isValid: formik.isValid,
    dirty: formik.dirty,
    validateForm: formik.validateForm,
    validateField: formik.validateField,
    formError,
    setFormError,
    ErrorDisplay,
  };
};

export default FormikFunction;
