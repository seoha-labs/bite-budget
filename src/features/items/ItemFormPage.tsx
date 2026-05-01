import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { NumberInput } from '../../components/NumberInput';
import { db } from '../../lib/firebase';
import { formatKRW, unitPrice as computeUnitPrice } from '../../lib/money';
import { UNITS, type Unit, unitLabel } from '../../lib/units';
import { useAuth } from '../auth/AuthProvider';
import {
  archiveItem,
  createItem,
  deleteItemHard,
  hasMealReferences,
  recalculatePastMealsForItem,
  unarchiveItem,
  updateItem,
} from './items.repo';
import type { Item } from './items.types';

function dateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function ItemFormPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'en' ? 'en' : 'ko';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = id !== undefined;

  const [name, setName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<string>(dateInputValue(new Date()));
  const [unit, setUnit] = useState<Unit>('piece');
  const [totalQuantity, setTotalQuantity] = useState<number | ''>('');
  const [totalPrice, setTotalPrice] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [existing, setExisting] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !isEdit || !id) return;
    void getDoc(doc(db, 'users', user.uid, 'items', id)).then((snap) => {
      if (!snap.exists()) return;
      const it = { id: snap.id, ...(snap.data() as Omit<Item, 'id'>) };
      setExisting(it);
      setName(it.name);
      setPurchaseDate(dateInputValue(it.purchaseDate.toDate()));
      setUnit(it.unit);
      setTotalQuantity(it.totalQuantity);
      setTotalPrice(it.totalPrice);
      setNote(it.note ?? '');
    });
  }, [user, isEdit, id]);

  const livePreview = useMemo(() => {
    const q = typeof totalQuantity === 'number' ? totalQuantity : 0;
    const p = typeof totalPrice === 'number' ? totalPrice : 0;
    return computeUnitPrice(p, q);
  }, [totalQuantity, totalPrice]);

  const canSave =
    name.trim().length > 0 &&
    typeof totalQuantity === 'number' &&
    totalQuantity > 0 &&
    typeof totalPrice === 'number' &&
    totalPrice >= 0 &&
    !saving;

  async function handleSave() {
    if (!user || !canSave) return;
    setSaving(true);
    try {
      const draft = {
        name,
        purchaseDate: new Date(purchaseDate),
        unit,
        totalQuantity: totalQuantity as number,
        totalPrice: totalPrice as number,
        note,
      };
      if (isEdit && id) {
        await updateItem(user.uid, id, draft);
      } else {
        await createItem(user.uid, draft);
      }
      navigate('/items', { replace: true });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOrArchive() {
    if (!user || !id) return;
    const referenced = await hasMealReferences(user.uid, id);
    if (referenced || (existing && existing.consumedQuantity > 0)) {
      await archiveItem(user.uid, id);
    } else {
      await deleteItemHard(user.uid, id);
    }
    navigate('/items', { replace: true });
  }

  async function handleUnarchive() {
    if (!user || !id) return;
    await unarchiveItem(user.uid, id);
    navigate('/items', { replace: true });
  }

  async function handleRecalc() {
    if (!user || !id) return;
    const { updated } = await recalculatePastMealsForItem(user.uid, id);
    alert(`Updated ${updated} meals`);
  }

  return (
    <>
      <AppHeader
        title={isEdit ? t('items.edit') : t('items.addNew')}
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
          label={t('items.name')}
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="계란"
        />
        <Input
          label={t('items.purchaseDate')}
          name="purchaseDate"
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
        />
        <div>
          <span className="mb-1 block text-sm font-medium">{t('items.unit')}</span>
          <div className="flex flex-wrap gap-2">
            {UNITS.map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  unit === u
                    ? 'bg-ink-900 text-ink-50'
                    : 'bg-ink-900/5 text-ink-900/70'
                }`}
              >
                {unitLabel(u, locale)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label={t('items.totalQuantity')}
            name="totalQuantity"
            value={totalQuantity}
            onChange={setTotalQuantity}
            min={0}
            step={0.01}
          />
          <NumberInput
            label={t('items.totalPrice')}
            name="totalPrice"
            value={totalPrice}
            onChange={setTotalPrice}
            min={0}
            step={1}
          />
        </div>
        <div className="rounded-xl bg-ink-900/5 px-3 py-2 text-sm">
          💡{' '}
          {t('items.unitPriceHint', {
            price: formatKRW(livePreview),
            unit: unitLabel(unit, locale),
          })}
        </div>
        <Input
          label={t('items.note')}
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {isEdit && existing && (
          <div className="space-y-2 pt-4">
            {existing.consumedQuantity > 0 && (
              <p className="text-xs text-ink-900/50">{t('items.consumedWarning')}</p>
            )}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => void handleRecalc()}
            >
              {t('items.recalcPast')}
            </Button>
            {existing.archived ? (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => void handleUnarchive()}
              >
                {t('items.unarchive')}
              </Button>
            ) : (
              <Button
                variant="danger"
                className="w-full"
                onClick={() => void handleDeleteOrArchive()}
              >
                {existing.consumedQuantity > 0 ? t('items.archive') : t('items.delete')}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
