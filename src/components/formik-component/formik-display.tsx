import React from 'react';

interface FormikErrorDisplayProps {
  error?: string;
  className?: string;
}

const FormikErrorDisplay: React.FC<FormikErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div>
      <p className="text-xs text-[var(--error)]">{error}</p>
    </div>
  );
};

export default FormikErrorDisplay;
