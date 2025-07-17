import React from 'react';

interface ActionButtonsProps {
  onAdd: () => void;
  onCancel: () => void;
  addLabel?: string;
  cancelLabel?: string;
  isAddDisabled?: boolean;
  addButtonClass?: string;
  cancelButtonClass?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAdd,
  onCancel,
  isAddDisabled,
  addLabel,
  cancelLabel,
  addButtonClass = '',
  cancelButtonClass = '',
}) => {
  return (
    <div className="flex justify-end gap-4 item-center">
      <button
        onClick={onCancel}
        className={`border border-[var(--button)] text-[var(--button)] px-4 min-w-[80px] max-w-[80px] rounded-sm font-medium transition-colors duration-100 cursor-pointer hover:bg-[var(--gray-100)] ${cancelButtonClass}`}
      >
        {cancelLabel || 'Cancel'}
      </button>
      <span>
        <button
          onClick={onAdd}
          disabled={isAddDisabled}
          className={`bg-[var(--button)] text-white px-4 py-1 min-w-[80px] max-w-[80px] rounded font-medium transition-colors duration-300 cursor-pointer hover:bg-[var(--button-hover)]
              ${
                isAddDisabled
                  ? 'bg-[var(--disable-button)] hover:bg-[var(--disable-button)] cursor-no-drop'
                  : 'bg-[var(--button)] hover:bg-[var(--button-hover)]'
              } ${addButtonClass}`}
        >
          {addLabel || 'Add'}
        </button>
      </span>
    </div>
  );
};

export default ActionButtons;
