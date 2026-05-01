import {
  Timestamp,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { roundKRW } from '../../lib/money';
import type { Item } from '../items/items.types';
import type { Consumption, Meal, MealDraft } from './meals.types';

const mealsCol = (uid: string) => collection(db, 'users', uid, 'meals');
const mealDoc = (uid: string, id: string) =>
  doc(db, 'users', uid, 'meals', id);
const itemDoc = (uid: string, id: string) =>
  doc(db, 'users', uid, 'items', id);

function uniqueItemIds(draft: MealDraft): string[] {
  return Array.from(new Set(draft.consumptions.map((c) => c.itemId)));
}

function aggregateDeltas(
  consumptions: { itemId: string; consumedQuantity: number }[],
): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of consumptions) {
    m.set(c.itemId, (m.get(c.itemId) ?? 0) + c.consumedQuantity);
  }
  return m;
}

// CREATE: snapshot current item prices, write meal + bump item counters in one tx.
export async function createMeal(uid: string, draft: MealDraft): Promise<string> {
  const newRef = doc(mealsCol(uid));
  const itemIds = uniqueItemIds(draft);

  await runTransaction(db, async (tx) => {
    const itemSnaps = await Promise.all(
      itemIds.map((id) => tx.get(itemDoc(uid, id))),
    );
    const itemMap = new Map<string, Item>();
    for (let i = 0; i < itemIds.length; i++) {
      const s = itemSnaps[i];
      if (!s.exists()) throw new Error(`item ${itemIds[i]} not found`);
      itemMap.set(itemIds[i], { id: s.id, ...(s.data() as Omit<Item, 'id'>) });
    }

    const consumptions: Consumption[] = draft.consumptions.map((c) => {
      const item = itemMap.get(c.itemId);
      if (!item) throw new Error(`item ${c.itemId} missing`);
      const share = roundKRW(item.unitPrice * c.consumedQuantity);
      return {
        itemId: c.itemId,
        itemNameSnapshot: item.name,
        unitSnapshot: item.unit,
        consumedQuantity: c.consumedQuantity,
        unitPriceSnapshot: item.unitPrice,
        costShare: share,
      };
    });

    const totalCost = consumptions.reduce((sum, c) => sum + c.costShare, 0);

    const deltas = aggregateDeltas(draft.consumptions);
    for (const [id, delta] of deltas) {
      const item = itemMap.get(id);
      if (!item) continue;
      const consumedQuantity = item.consumedQuantity + delta;
      const remainingQuantity = item.totalQuantity - consumedQuantity;
      const remainingValue = roundKRW(item.unitPrice * remainingQuantity);
      tx.update(itemDoc(uid, id), {
        consumedQuantity,
        remainingQuantity,
        remainingValue,
        updatedAt: serverTimestamp(),
      });
    }

    tx.set(newRef, {
      eatenAt: Timestamp.fromDate(draft.eatenAt),
      label: draft.label,
      note: draft.note?.trim() || null,
      consumptions,
      itemIds: Array.from(deltas.keys()),
      totalCost,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return newRef.id;
}

// EDIT: reverse old deltas, apply new ones using current unit prices.
export async function updateMeal(
  uid: string,
  id: string,
  draft: MealDraft,
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const mealRef = mealDoc(uid, id);
    const mealSnap = await tx.get(mealRef);
    if (!mealSnap.exists()) throw new Error('meal not found');
    const prev = mealSnap.data() as Meal;

    const oldDeltas = aggregateDeltas(prev.consumptions);
    const newDeltas = aggregateDeltas(draft.consumptions);
    const touchedIds = Array.from(
      new Set([...oldDeltas.keys(), ...newDeltas.keys()]),
    );

    const itemSnaps = await Promise.all(
      touchedIds.map((tid) => tx.get(itemDoc(uid, tid))),
    );
    const itemMap = new Map<string, Item>();
    for (let i = 0; i < touchedIds.length; i++) {
      const s = itemSnaps[i];
      if (!s.exists()) {
        // Skip deleted/archived items in the *new* set; allow reversing old.
        if (newDeltas.has(touchedIds[i])) {
          throw new Error(`item ${touchedIds[i]} not found`);
        }
        continue;
      }
      itemMap.set(touchedIds[i], { id: s.id, ...(s.data() as Omit<Item, 'id'>) });
    }

    const consumptions: Consumption[] = draft.consumptions.map((c) => {
      const item = itemMap.get(c.itemId);
      if (!item) throw new Error(`item ${c.itemId} missing`);
      const share = roundKRW(item.unitPrice * c.consumedQuantity);
      return {
        itemId: c.itemId,
        itemNameSnapshot: item.name,
        unitSnapshot: item.unit,
        consumedQuantity: c.consumedQuantity,
        unitPriceSnapshot: item.unitPrice,
        costShare: share,
      };
    });
    const totalCost = consumptions.reduce((sum, c) => sum + c.costShare, 0);

    for (const tid of touchedIds) {
      const item = itemMap.get(tid);
      if (!item) continue;
      const oldDelta = oldDeltas.get(tid) ?? 0;
      const newDelta = newDeltas.get(tid) ?? 0;
      const consumedQuantity = item.consumedQuantity - oldDelta + newDelta;
      const remainingQuantity = item.totalQuantity - consumedQuantity;
      const remainingValue = roundKRW(item.unitPrice * remainingQuantity);
      tx.update(itemDoc(uid, tid), {
        consumedQuantity,
        remainingQuantity,
        remainingValue,
        updatedAt: serverTimestamp(),
      });
    }

    tx.update(mealRef, {
      eatenAt: Timestamp.fromDate(draft.eatenAt),
      label: draft.label,
      note: draft.note?.trim() || null,
      consumptions,
      itemIds: Array.from(newDeltas.keys()),
      totalCost,
      updatedAt: serverTimestamp(),
    });
  });
}

// DELETE: reverse the meal's deltas on each referenced item, then delete.
export async function deleteMeal(uid: string, id: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const mealRef = mealDoc(uid, id);
    const mealSnap = await tx.get(mealRef);
    if (!mealSnap.exists()) return;
    const prev = mealSnap.data() as Meal;

    const deltas = aggregateDeltas(prev.consumptions);
    const ids = Array.from(deltas.keys());
    const itemSnaps = await Promise.all(ids.map((iid) => tx.get(itemDoc(uid, iid))));

    for (let i = 0; i < ids.length; i++) {
      const s = itemSnaps[i];
      if (!s.exists()) continue;
      const item = { id: s.id, ...(s.data() as Omit<Item, 'id'>) };
      const delta = deltas.get(ids[i]) ?? 0;
      const consumedQuantity = Math.max(0, item.consumedQuantity - delta);
      const remainingQuantity = item.totalQuantity - consumedQuantity;
      const remainingValue = roundKRW(item.unitPrice * remainingQuantity);
      tx.update(itemDoc(uid, ids[i]), {
        consumedQuantity,
        remainingQuantity,
        remainingValue,
        updatedAt: serverTimestamp(),
      });
    }

    tx.delete(mealRef);
  });
}
