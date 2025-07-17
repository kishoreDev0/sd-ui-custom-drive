import {
  NUMBER_REGEX,
  SPECIAL_CHARACTER_REGEX,
  UPPERCASE_REGEX,
} from '@/utils/constants';
import React from 'react';

interface PasswordStrengthBarProps {
  password: string;
}

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({
  password,
}) => {
  const calculateStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 30;
    if (UPPERCASE_REGEX.test(password)) strength += 20;
    if (NUMBER_REGEX.test(password)) strength += 20;
    if (SPECIAL_CHARACTER_REGEX.test(password)) strength += 30;
    return strength;
  };

  const strength = calculateStrength(password);

  const getPasswordStrengthColor = () => {
    if (strength <= 40) return 'bg-[var(--error)] w-1/5';
    else if (strength <= 60) return 'bg-[var(--warning)] w-2/5';
    else if (strength <= 80) return 'bg-[var(--warning)] w-4/5';
    return 'bg-[var(--success)] w-full';
  };
  return (
    <div className="w-full h-1 mt-2 rounded bg-[var(--disable-button)]">
      <div
        className={`h-full rounded-full transition-all ${getPasswordStrengthColor()}`}
      ></div>
    </div>
  );
};

export default PasswordStrengthBar;
