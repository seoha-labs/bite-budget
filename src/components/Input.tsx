import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className = '', id, ...rest }: Props) {
  const inputId = id ?? rest.name;
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={inputId}>
      {label && <span className="font-medium">{label}</span>}
      <input
        {...rest}
        id={inputId}
        className={`w-full rounded-xl border border-ink-900/15 bg-white px-3 py-2.5 text-base outline-none focus:border-ink-900 ${className}`}
      />
    </label>
  );
}
