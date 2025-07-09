// backfill-user-plans.js
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// TODO: Replace with your service account key path or set GOOGLE_APPLICATION_CREDENTIALS env var
// const serviceAccount = require('./path/to/serviceAccountKey.json');

// Uncomment and edit below if not using env var:
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Use default credentials (set GOOGLE_APPLICATION_CREDENTIALS env var)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = getFirestore();

async function backfillUserPlans() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  let updated = 0;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const updates = {};
    if (!('plan' in data)) updates.plan = 'free';
    if (!('analysesUsedThisMonth' in data)) updates.analysesUsedThisMonth = 0;
    if (!('billingRenewalDate' in data)) updates.billingRenewalDate = Timestamp.now();
    if (Object.keys(updates).length > 0) {
      await docSnap.ref.update(updates);
      updated++;
      console.log(`Updated user ${docSnap.id}:`, updates);
    }
  }
  console.log(`Backfill complete. Updated ${updated} user(s).`);
}

backfillUserPlans().catch(err => {
  console.error('Error during backfill:', err);
  process.exit(1);
}); 