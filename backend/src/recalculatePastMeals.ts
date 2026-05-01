// Scaffold only — not exported in MVP. Server-side mirror of the client
// "Recalculate past meals" routine, intended for users with thousands of meals
// where chunked client batches become slow.
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { admin } from './lib/admin';

type Payload = { itemId: string };

export const recalculatePastMeals = onCall<Payload>(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'sign in required');
  const itemId = request.data?.itemId;
  if (!itemId) throw new HttpsError('invalid-argument', 'itemId required');
  admin();
  const db = getFirestore();
  const uid = request.auth.uid;

  const itemSnap = await db.doc(`users/${uid}/items/${itemId}`).get();
  if (!itemSnap.exists) throw new HttpsError('not-found', 'item missing');
  const item = itemSnap.data() as {
    name: string;
    unit: string;
    unitPrice: number;
  };

  const mealsSnap = await db
    .collection(`users/${uid}/meals`)
    .where('itemIds', 'array-contains', itemId)
    .get();

  let updated = 0;
  let batch = db.batch();
  let opCount = 0;
  for (const m of mealsSnap.docs) {
    const data = m.data() as {
      consumptions: Array<{
        itemId: string;
        consumedQuantity: number;
        costShare: number;
        unitPriceSnapshot: number;
        itemNameSnapshot: string;
        unitSnapshot: string;
      }>;
      totalCost: number;
    };
    const next = data.consumptions.map((c) => {
      if (c.itemId !== itemId) return c;
      const share = Math.round(item.unitPrice * c.consumedQuantity);
      return {
        ...c,
        itemNameSnapshot: item.name,
        unitSnapshot: item.unit,
        unitPriceSnapshot: item.unitPrice,
        costShare: share,
      };
    });
    const totalCost = next.reduce((s, c) => s + c.costShare, 0);
    if (totalCost === data.totalCost) continue;
    batch.update(m.ref, { consumptions: next, totalCost });
    updated++;
    opCount++;
    if (opCount >= 400) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  }
  if (opCount > 0) await batch.commit();
  return { updated };
});
