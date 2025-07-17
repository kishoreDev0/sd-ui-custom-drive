import React from 'react';
import { X } from 'lucide-react';

interface CloseIconProps {
  onClick: () => void;
  className?: string;
  size?: number;
}

const CloseIcon: React.FC<CloseIconProps> = ({
  onClick,
  className = '',
  size = 18,
}) => {
  return (
    <button
      onClick={onClick}
      className={`absolute top-6 right-5 text-black hover:text-[var(--label)] cursor-pointer ${className}`}
      aria-label="Close"
    >
      <X size={size} />
    </button>
  );
};

export default CloseIcon;
