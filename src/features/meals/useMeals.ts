import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type QueryConstraint,
  Timestamp,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import type { Meal } from './meals.types';

type Range = { start: Date; end: Date };

export function useMeals(uid: string | null, range?: Range): {
  meals: Meal[];
  loading: boolean;
} {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const startMs = range ? range.start.getTime() : null;
  const endMs = range ? range.end.getTime() : null;

  useEffect(() => {
    if (!uid) {
      setMeals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const constraints: QueryConstraint[] = [];
    if (startMs !== null && endMs !== null) {
      constraints.push(where('eatenAt', '>=', Timestamp.fromMillis(startMs)));
      constraints.push(where('eatenAt', '<=', Timestamp.fromMillis(endMs)));
    }
    constraints.push(orderBy('eatenAt', 'desc'));
    const q = query(collection(db, 'users', uid, 'meals'), ...constraints);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMeals(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Meal, 'id'>) })),
        );
        setLoading(false);
      },
      (err) => {
        console.error('useMeals snapshot error:', err);
        setMeals([]);
        setLoading(false);
      },
    );
    return unsub;
  }, [uid, startMs, endMs]);

  return { meals, loading };
}
