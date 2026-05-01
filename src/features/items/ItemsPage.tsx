import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/AppHeader';
import { useAuth } from '../auth/AuthProvider';
import { ItemCard } from './ItemCard';
import { useItems } from './useItems';

export function ItemsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { items, loading } = useItems(user?.uid ?? null);
  const [filter, setFilter] = useState<'inStock' | 'archived'>('inStock');

  const visible = items.filter((it) =>
    filter === 'inStock' ? !it.archived : it.archived,
  );

  return (
    <>
      <AppHeader title={t('items.title')} />
      <div className="px-4 pt-3">
        <div className="flex gap-2">
          {(['inStock', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs ${
                filter === f
                  ? 'bg-ink-900 text-ink-50'
                  : 'bg-ink-900/5 text-ink-900/70'
              }`}
            >
              {t(`items.filter.${f}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2 px-4 py-3">
        {loading ? (
          <div className="py-8 text-center text-ink-900/50">{t('common.loading')}</div>
        ) : visible.length === 0 ? (
          <div className="py-8 text-center text-ink-900/50">{t('items.empty')}</div>
        ) : (
          visible.map((it) => <ItemCard key={it.id} item={it} />)
        )}
      </div>
      <Link
        to="/items/new"
        className="fixed bottom-20 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-2xl text-ink-50 shadow-lg"
        aria-label={t('items.addNew')}
      >
        ＋
      </Link>
    </>
  );
}
