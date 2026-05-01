import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

type Props = {
  title: string;
  back?: boolean;
  right?: ReactNode;
};

export function AppHeader({ title, back, right }: Props) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-ink-900/10 bg-white/90 px-3 backdrop-blur">
      <div className="flex items-center gap-2">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 text-ink-900/70 hover:bg-ink-900/5"
            aria-label="back"
          >
            ←
          </button>
        )}
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-1">{right}</div>
    </header>
  );
}
