import React from 'react';

interface ConfirmationModalProps {
  labelHeading: string;
  label: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  labelHeading,
  label,
  isOpen,
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[var(--bg-modal)]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white p-6 rounded-md w-md max-w-sm sm:max-w-md md:max-w-lg text-left shadow-md cursor-default">
        <p className="text-lg font-bold text-[var(--label)]">{labelHeading}</p>
        <p className="text-[var(--label)] mt-1 mb-6 text-justify">{label}</p>
        <div className="flex justify-end gap-4">
          <button
            className="border border-[var(--button)] text-[var(--button)] px-4 py-1 rounded font-medium transition-colors duration-300 cursor-pointer hover:bg-[var(--gray-100)]"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-[var(--button)] text-white px-4 py-1 rounded font-medium transition-colors duration-300 cursor-pointer hover:bg-[var(--button-hover)]"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
