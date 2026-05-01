import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { roundKRW, unitPrice as computeUnitPrice } from '../../lib/money';
import type { Item, ItemDraft } from './items.types';

const itemsCol = (uid: string) => collection(db, 'users', uid, 'items');
const itemDoc = (uid: string, id: string) =>
  doc(db, 'users', uid, 'items', id);

export async function createItem(uid: string, draft: ItemDraft): Promise<string> {
  const up = computeUnitPrice(draft.totalPrice, draft.totalQuantity);
  const ref = await addDoc(itemsCol(uid), {
    name: draft.name.trim(),
    purchaseDate: Timestamp.fromDate(draft.purchaseDate),
    unit: draft.unit,
    totalQuantity: draft.totalQuantity,
    totalPrice: draft.totalPrice,
    unitPrice: up,
    consumedQuantity: 0,
    remainingQuantity: draft.totalQuantity,
    remainingValue: roundKRW(up * draft.totalQuantity),
    note: draft.note?.trim() || null,
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateItem(
  uid: string,
  id: string,
  draft: ItemDraft,
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = itemDoc(uid, id);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('item not found');
    const prev = snap.data() as Item;
    const newUp = computeUnitPrice(draft.totalPrice, draft.totalQuantity);
    const remainingQuantity = Math.max(
      0,
      draft.totalQuantity - prev.consumedQuantity,
    );
    tx.update(ref, {
      name: draft.name.trim(),
      purchaseDate: Timestamp.fromDate(draft.purchaseDate),
      unit: draft.unit,
      totalQuantity: draft.totalQuantity,
      totalPrice: draft.totalPrice,
      unitPrice: newUp,
      remainingQuantity,
      remainingValue: roundKRW(newUp * remainingQuantity),
      note: draft.note?.trim() || null,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function archiveItem(uid: string, id: string): Promise<void> {
  await updateDoc(itemDoc(uid, id), {
    archived: true,
    updatedAt: serverTimestamp(),
  });
}

export async function unarchiveItem(uid: string, id: string): Promise<void> {
  await updateDoc(itemDoc(uid, id), {
    archived: false,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteItemHard(uid: string, id: string): Promise<void> {
  // Caller must verify no meals reference this item.
  await deleteDoc(itemDoc(uid, id));
}

export async function hasMealReferences(uid: string, id: string): Promise<boolean> {
  const q = query(
    collection(db, 'users', uid, 'meals'),
    where('itemIds', 'array-contains', id),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// "Recalculate past meals" — re-snapshot every meal that references this item
// using the item's current unitPrice and unit. Idempotent.
export async function recalculatePastMealsForItem(
  uid: string,
  id: string,
): Promise<{ updated: number }> {
  const itemSnap = await getDoc(itemDoc(uid, id));
  if (!itemSnap.exists()) return { updated: 0 };
  const item = itemSnap.data() as Item;

  const mealsQ = query(
    collection(db, 'users', uid, 'meals'),
    where('itemIds', 'array-contains', id),
  );
  const mealsSnap = await getDocs(mealsQ);

  let updated = 0;
  let batch = writeBatch(db);
  let opCount = 0;

  for (const m of mealsSnap.docs) {
    const data = m.data() as {
      consumptions: Array<{
        itemId: string;
        itemNameSnapshot: string;
        unitSnapshot: string;
        consumedQuantity: number;
        unitPriceSnapshot: number;
        costShare: number;
      }>;
      totalCost: number;
    };
    const next = data.consumptions.map((c) => {
      if (c.itemId !== id) return c;
      const share = roundKRW(item.unitPrice * c.consumedQuantity);
      return {
        ...c,
        itemNameSnapshot: item.name,
        unitSnapshot: item.unit,
        unitPriceSnapshot: item.unitPrice,
        costShare: share,
      };
    });
    const totalCost = next.reduce((sum, c) => sum + c.costShare, 0);
    if (
      totalCost === data.totalCost &&
      next.every((c, idx) => c.costShare === data.consumptions[idx]?.costShare)
    ) {
      continue;
    }
    batch.update(m.ref, { consumptions: next, totalCost, updatedAt: serverTimestamp() });
    updated++;
    opCount++;
    if (opCount >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      opCount = 0;
    }
  }
  if (opCount > 0) await batch.commit();
  return { updated };
}
