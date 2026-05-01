import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { db } from '../../lib/firebase';
import { formatKRW, roundKRW } from '../../lib/money';
import { unitLabel, isUnit } from '../../lib/units';
import { useAuth } from '../auth/AuthProvider';
import { useItems } from '../items/useItems';
import { ConsumptionPicker } from './ConsumptionPicker';
import { createMeal, deleteMeal, updateMeal } from './meals.repo';
import type { ConsumptionDraft, Meal, MealLabel } from './meals.types';

const LABELS: MealLabel[] = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

function dtLocalValue(d: Date): string {
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MealFormPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'en' ? 'en' : 'ko';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = id !== undefined;

  const { items } = useItems(user?.uid ?? null);
  const [eatenAt, setEatenAt] = useState<string>(dtLocalValue(new Date()));
  const [label, setLabel] = useState<MealLabel>('lunch');
  const [note, setNote] = useState('');
  const [drafts, setDrafts] = useState<ConsumptionDraft[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [existing, setExisting] = useState<Meal | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !isEdit || !id) return;
    void getDoc(doc(db, 'users', user.uid, 'meals', id)).then((snap) => {
      if (!snap.exists()) return;
      const m = { id: snap.id, ...(snap.data() as Omit<Meal, 'id'>) };
      setExisting(m);
      setEatenAt(dtLocalValue(m.eatenAt.toDate()));
      setLabel(m.label);
      setNote(m.note ?? '');
      setDrafts(
        m.consumptions.map((c) => ({
          itemId: c.itemId,
          consumedQuantity: c.consumedQuantity,
        })),
      );
    });
  }, [user, isEdit, id]);

  // Compute live preview using *current* item unit prices.
  const itemMap = useMemo(() => {
    const map = new Map<string, (typeof items)[number]>();
    for (const it of items) map.set(it.id, it);
    return map;
  }, [items]);

  const previewLines = drafts.map((d) => {
    const item = itemMap.get(d.itemId);
    if (!item) {
      // Fall back to existing snapshot for items not yet loaded or archived.
      const snap = existing?.consumptions.find((c) => c.itemId === d.itemId);
      return {
        draft: d,
        name: snap?.itemNameSnapshot ?? '?',
        unit: snap?.unitSnapshot ?? '',
        share: snap ? roundKRW(snap.unitPriceSnapshot * d.consumedQuantity) : 0,
      };
    }
    return {
      draft: d,
      name: item.name,
      unit: isUnit(item.unit) ? unitLabel(item.unit, locale) : item.unit,
      share: roundKRW(item.unitPrice * d.consumedQuantity),
    };
  });
  const totalCost = previewLines.reduce((sum, l) => sum + l.share, 0);

  function addDraft(itemId: string, qty: number) {
    setDrafts((prev) => [...prev, { itemId, consumedQuantity: qty }]);
  }

  function removeDraft(idx: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== idx));
  }

  const canSave = drafts.length > 0 && !saving;

  async function handleSave() {
    if (!user || !canSave) return;
    setSaving(true);
    try {
      const draft = {
        eatenAt: new Date(eatenAt),
        label,
        note,
        consumptions: drafts,
      };
      if (isEdit && id) {
        await updateMeal(user.uid, id, draft);
      } else {
        await createMeal(user.uid, draft);
      }
      navigate('/meals', { replace: true });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user || !id) return;
    await deleteMeal(user.uid, id);
    navigate('/meals', { replace: true });
  }

  return (
    <>
      <AppHeader
        title={isEdit ? t('meals.edit') : t('meals.addNew')}
        back
        right={
          <Button
            variant="ghost"
            disabled={!canSave}
            onClick={() => void handleSave()}
          >
            {t('common.save')}
          </Button>
        }
      />
      <div className="space-y-4 px-4 py-4">
        <Input
          label={t('meals.eatenAt')}
          name="eatenAt"
          type="datetime-local"
          value={eatenAt}
          onChange={(e) => setEatenAt(e.target.value)}
        />
        <div>
          <span className="mb-1 block text-sm font-medium">{t('meals.label')}</span>
          <div className="flex flex-wrap gap-2">
            {LABELS.map((l) => (
              <button
                key={l}
                onClick={() => setLabel(l)}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  label === l
                    ? 'bg-ink-900 text-ink-50'
                    : 'bg-ink-900/5 text-ink-900/70'
                }`}
              >
                {t(`meals.labels.${l}`)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium">
            {t('meals.consumptions')}
          </span>
          <div className="space-y-2 rounded-xl border border-ink-900/10 p-2">
            {previewLines.map((line, idx) => (
              <div
                key={idx}
                className="flex items-baseline justify-between border-b border-ink-900/5 pb-2 last:border-b-0 last:pb-0"
              >
                <div className="text-sm">
                  <span className="font-medium">{line.name}</span>
                  <span className="ml-2 text-ink-900/60">
                    {line.draft.consumedQuantity} {line.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatKRW(line.share)}</span>
                  <button
                    onClick={() => removeDraft(idx)}
                    className="rounded-full p-1 text-ink-900/50 hover:bg-ink-900/5"
                    aria-label="remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setPickerOpen(true)}
              className="w-full rounded-lg bg-ink-900/5 py-2 text-sm text-ink-900/70 hover:bg-ink-900/10"
            >
              ＋ {t('meals.addConsumption')}
            </button>
          </div>
        </div>
        <Input
          label={t('common.note')}
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="rounded-xl bg-ink-900 px-4 py-3 text-right text-base font-semibold text-ink-50">
          {t('meals.totalCost')} {formatKRW(totalCost)}
        </div>
        {isEdit && existing && (
          <Button
            variant="danger"
            className="w-full"
            onClick={() => void handleDelete()}
          >
            {t('items.delete')}
          </Button>
        )}
      </div>
      <ConsumptionPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        items={items}
        onAdd={addDraft}
      />
    </>
  );
}
