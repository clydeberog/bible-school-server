import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  isBusy = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md rounded-lg border border-[#E5DFD3] bg-[#FBF9F5] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#9A3412]/25 bg-[#9A3412]/10 text-[#9A3412]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3
              id="confirm-modal-title"
              className="font-serif text-xl font-semibold text-[#1E293B]"
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            aria-label="Close confirmation dialog"
            className="rounded p-1.5 text-[#57534E] hover:bg-[#EBE6DF] hover:text-[#1E293B] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[#57534E]">{description}</p>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#E5DFD3] pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="rounded-md border border-[#E5DFD3] bg-white px-4 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#F5F1E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="rounded-md bg-[#9A3412] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7C2D12] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            {isBusy ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
