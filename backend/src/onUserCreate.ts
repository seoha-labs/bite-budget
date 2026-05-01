import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { beforeUserCreated } from 'firebase-functions/v2/identity';
import { admin } from './lib/admin';

// v2 blocking auth trigger — fires before the user record is created.
// We seed the profile doc here so it always exists by the time the client
// finishes signing in.
export const onUserCreate = beforeUserCreated(async (event) => {
  if (!event.data) return;
  admin();
  const db = getFirestore();
  const uid = event.data.uid;
  await db.doc(`users/${uid}`).set(
    {
      displayName: event.data.displayName ?? '',
      email: event.data.email ?? '',
      photoURL: event.data.photoURL ?? null,
      currency: 'KRW',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
});
