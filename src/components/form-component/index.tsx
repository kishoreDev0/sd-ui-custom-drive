import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodObject } from 'zod';
import { cn } from '@/lib/utils';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'select'
    | 'textarea'
    | 'checkbox'
    | 'radio'
    | 'number';
  placeholder?: string;
  options?: FieldOption[];
  required?: boolean;
  className?: string;
  customValidation?: z.ZodType;
  validationMessage?: string;
  matchField?: string;
  renderAfterField?: () => React.ReactNode;
}

interface DynamicFormProps {
  fields: FieldConfig[];
  onSubmit: (values: Record<string, string>) => void;
  submitText: string;
  initialValues?: { [key: string]: string | number | boolean };
  onFieldChange?: (fieldName: string, value: string) => void;
  renderBetweenFields?: () => React.ReactNode;
  splitFields?: boolean;
  className?: string;
  customSchema?: ZodObject<Record<string, z.ZodTypeAny>>;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  submitText,
  initialValues = {},
  onFieldChange,
  renderBetweenFields,
  splitFields = false,
  className,
}) => {
  const schema = z.object(
    fields.reduce(
      (acc, field) => {
        if (field.customValidation) {
          acc[field.name] = field.customValidation;
          return acc;
        }
        if (field.name === 'password') {
          acc[field.name] = z
            .string()
            .min(1, field.validationMessage || `${field.label} is required`);
          return acc;
        }
        if (field.name === 'confirmPassword') {
          acc[field.name] = z
            .string()
            .refine((val) => val === initialValues.password, {
              message: 'Passwords do not match',
            });
          return acc;
        }

        if (field.required) {
          if (field.type === 'email') {
            acc[field.name] = z
              .string()
              .email(
                field.validationMessage ||
                  `${field.label} must be a valid email`,
              );
          } else if (field.type === 'select' || field.type === 'radio') {
            acc[field.name] = z
              .string()
              .min(1, field.validationMessage || `${field.label} is required`);
          } else if (field.type === 'checkbox') {
            acc[field.name] = z
              .boolean()
              .refine(
                (val) => val === true,
                field.validationMessage ||
                  'Please accept the Terms and Privacy Policy',
              );
          } else {
            acc[field.name] = z
              .string()
              .min(1, field.validationMessage || `${field.label} is required`);
          }
        } else {
          acc[field.name] =
            field.type === 'checkbox'
              ? z.boolean().optional()
              : z.string().optional();
        }
        return acc;
      },
      {} as Record<string, z.ZodTypeAny>,
    ),
  );

  const {
    handleSubmit,
    control,
    register,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const watchAllFields = watch();

  useEffect(() => {
    if (onFieldChange) {
      Object.entries(watchAllFields).forEach(([name, value]) => {
        if (value !== initialValues[name]) {
          onFieldChange(name, value);
        }
      });
    }
  }, [watchAllFields, onFieldChange, initialValues]);

  const inputBaseClasses =
    'appearance-none block w-full px-3 py-2 border border-[var(--gray-300)] rounded-md shadow-sm placeholder-[var(--gray-400)] focus:outline-none focus:ring-[var(--focus)] focus:border-[var(--focus)] sm:text-sm';
  const errorInputClasses =
    'border-[var(--error-bg)] focus:ring-[var(--error)] focus:border-[var(--error)]';

  const renderField = (field: FieldConfig) => (
    <div key={field.name}>
      <div className={field.className || 'space-y-1 mb-4'}>
        {field.type !== 'checkbox' && (
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-[var(--gray-700)]"
          >
            {field.label}{' '}
            {field.required && <span className="text-[var(--error)]">*</span>}
          </label>
        )}
        {field.type === 'select' ? (
          <Controller
            name={field.name}
            control={control}
            render={({ field: selectField }) => (
              <select
                {...selectField}
                className={cn(
                  inputBaseClasses,
                  errors[field.name] ? errorInputClasses : '',
                  'mt-1',
                )}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
        ) : field.type === 'textarea' ? (
          <textarea
            {...register(field.name, {
              onChange: (e) => {
                onFieldChange?.(field.name, e.target.value);
              },
            })}
            placeholder={field.placeholder}
            className={cn(
              inputBaseClasses,
              errors[field.name] ? errorInputClasses : '',
              'mt-1',
            )}
          />
        ) : field.type === 'checkbox' ? (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              {...register(field.name, {
                onChange: (e) => {
                  onFieldChange?.(field.name, e.target.value);
                },
              })}
              className="h-4 w-4 text-[var(--focus)] border-[var(--gray-300)] rounded focus:ring-[var(--focus)]"
            />
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-[var(--gray-700)]"
            >
              {field.label}{' '}
              {field.required && <span className="text-[var(--error)]">*</span>}
            </label>
          </div>
        ) : (
          <input
            type={field.type}
            placeholder={field.placeholder}
            {...register(field.name, {
              onChange: (e) => {
                onFieldChange?.(field.name, e.target.value);
              },
            })}
            className={cn(
              inputBaseClasses,
              errors[field.name] ? errorInputClasses : '',
              'mt-1',
            )}
          />
        )}
        {errors[field.name] && (
          <p className="mt-1 text-sm text-[var(--error)]">
            {errors[field.name]?.message as string}
          </p>
        )}
      </div>
      {field.renderAfterField && field.renderAfterField()}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        'space-y-2 bg-white p-3 rounded-xl max-w-md mx-auto',
        className,
      )}
      noValidate
    >
      {renderBetweenFields && renderBetweenFields()}

      {splitFields ? (
        <div className="grid grid-cols-2 gap-x-4">
          {fields.map((field) => (
            <div key={field.name} className="col-span-1">
              {renderField(field)}
            </div>
          ))}
        </div>
      ) : (
        fields.map(renderField)
      )}

      <button
        type="submit"
        className="w-full py-2 px-4 bg-[var(--button)] text-white rounded-md hover:bg-[var(--button-hover)] cursor-pointer"
      >
        {submitText}
      </button>
    </form>
  );
};

export default DynamicForm;
