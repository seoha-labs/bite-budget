// Scaffold only — not exported in MVP. Will be wired up when CSV/JSON export
// is needed. Intent: HTTPS callable returning a download URL for the caller's
// items + meals collected into a single archive.
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { admin } from './lib/admin';

export const exportUserData = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'sign in required');
  admin();
  const db = getFirestore();
  const uid = request.auth.uid;
  const [items, meals] = await Promise.all([
    db.collection(`users/${uid}/items`).get(),
    db.collection(`users/${uid}/meals`).get(),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    items: items.docs.map((d) => ({ id: d.id, ...d.data() })),
    meals: meals.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
});
