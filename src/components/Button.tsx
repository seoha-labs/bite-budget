import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-ink-50 hover:bg-ink-900/90 active:bg-ink-900/80 disabled:opacity-50',
  ghost:
    'bg-transparent text-ink-900 hover:bg-ink-900/5 active:bg-ink-900/10 disabled:opacity-40',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-50',
};

export function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${variantClass[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
