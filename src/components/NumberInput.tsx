import { Input } from './Input';

type Props = {
  label?: string;
  name?: string;
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  step?: number;
  placeholder?: string;
};

export function NumberInput({ label, name, value, onChange, min, step, placeholder }: Props) {
  return (
    <Input
      label={label}
      name={name}
      type="number"
      inputMode="decimal"
      min={min}
      step={step}
      placeholder={placeholder}
      value={value === '' ? '' : value}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === '') {
          onChange('');
          return;
        }
        const n = Number(raw);
        if (Number.isFinite(n)) onChange(n);
      }}
    />
  );
}
