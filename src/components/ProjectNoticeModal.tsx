import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ProjectNoticeModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export const ProjectNoticeModal: React.FC<ProjectNoticeModalProps> = ({
  isOpen,
  onContinue,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-notice-title"
      aria-describedby="project-notice-desc"
    >
      <div className="w-full max-w-md rounded-xl border border-[#E5DFD3] bg-[#FBF9F5] p-6 sm:p-7 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#B45309]/25 bg-[#FEF3C7] text-[#78350F]">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-[#78350F]">
              Site Notice
            </p>
            <h2
              id="project-notice-title"
              className="mt-1 font-serif text-2xl font-semibold text-[#1E293B]"
            >
              Ongoing Project Warning
            </h2>
          </div>
        </div>

        <p
          id="project-notice-desc"
          className="mt-4 text-sm leading-relaxed text-[#57534E]"
        >
          This is an ongoing project. The details, schedules, course listings, and information inside are not yet final and are subject to change.
        </p>

        <div className="mt-6 flex justify-end border-t border-[#E5DFD3] pt-4">
          <button
            type="button"
            onClick={onContinue}
            className="w-full sm:w-auto rounded-md bg-[#1E3A8A] px-5 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#172D6B] transition-colors cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
