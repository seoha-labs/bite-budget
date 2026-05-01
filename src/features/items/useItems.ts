import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type QuerySnapshot,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import type { Item } from './items.types';

export function useItems(uid: string | null): { items: Item[]; loading: boolean } {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, 'users', uid, 'items'),
      orderBy('purchaseDate', 'desc'),
    );
    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot) => {
        setItems(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Item, 'id'>) })),
        );
        setLoading(false);
      },
      (err) => {
        console.error('useItems snapshot error:', err);
        setItems([]);
        setLoading(false);
      },
    );
    return unsub;
  }, [uid]);

  return { items, loading };
}
