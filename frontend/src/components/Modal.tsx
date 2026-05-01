import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-ink-900/60 hover:bg-ink-900/5"
              aria-label="close"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
