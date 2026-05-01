import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { NumberInput } from '../../components/NumberInput';
import { formatKRW, roundKRW } from '../../lib/money';
import { unitLabel } from '../../lib/units';
import type { Item } from '../items/items.types';

type Props = {
  open: boolean;
  onClose: () => void;
  items: Item[];
  onAdd: (itemId: string, qty: number) => void;
};

export function ConsumptionPicker({ open, onClose, items, onAdd }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'en' ? 'en' : 'ko';
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qty, setQty] = useState<number | ''>('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items
      .filter((it) => !it.archived)
      .filter((it) => (term ? it.name.toLowerCase().includes(term) : true));
  }, [items, search]);

  const selected = items.find((it) => it.id === selectedId) ?? null;
  const projected =
    selected && typeof qty === 'number'
      ? roundKRW(selected.unitPrice * qty)
      : 0;

  function reset() {
    setSearch('');
    setSelectedId(null);
    setQty('');
  }

  function handleAdd() {
    if (!selected || typeof qty !== 'number' || qty <= 0) return;
    onAdd(selected.id, qty);
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={t('meals.selectItem')}
    >
      <input
        autoFocus
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍"
        className="mb-3 w-full rounded-xl border border-ink-900/15 px-3 py-2 outline-none focus:border-ink-900"
      />
      <div className="max-h-60 overflow-y-auto rounded-xl border border-ink-900/10">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-sm text-ink-900/50">
            {t('items.empty')}
          </div>
        ) : (
          filtered.map((it) => (
            <button
              key={it.id}
              onClick={() => setSelectedId(it.id)}
              className={`flex w-full items-baseline justify-between border-b border-ink-900/5 px-3 py-2 text-left text-sm last:border-b-0 ${
                selectedId === it.id ? 'bg-ink-900/5' : ''
              }`}
            >
              <span className="font-medium">{it.name}</span>
              <span className="text-xs text-ink-900/60">
                {it.remainingQuantity}/{it.totalQuantity} {unitLabel(it.unit, locale)}
                {' · '}
                {formatKRW(it.unitPrice)}/{unitLabel(it.unit, locale)}
              </span>
            </button>
          ))
        )}
      </div>
      {selected && (
        <div className="mt-4 space-y-3">
          <div className="text-sm">
            <span className="font-medium">{selected.name}</span>
            <span className="ml-2 text-ink-900/60">
              ({formatKRW(selected.unitPrice)}/{unitLabel(selected.unit, locale)})
            </span>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <NumberInput
                label={t('meals.qty')}
                name="qty"
                value={qty}
                onChange={setQty}
                min={0}
                step={0.01}
              />
            </div>
            <span className="pb-3 text-sm text-ink-900/60">
              {unitLabel(selected.unit, locale)}
            </span>
          </div>
          <div className="rounded-xl bg-ink-900/5 px-3 py-2 text-sm">
            {t('meals.share')}: {formatKRW(projected)}
          </div>
          <Button
            className="w-full"
            disabled={typeof qty !== 'number' || qty <= 0}
            onClick={handleAdd}
          >
            {t('meals.addConsumption')}
          </Button>
        </div>
      )}
    </Modal>
  );
}
