import { db } from '$lib/firebase';
import { collection, addDoc, deleteDoc, query, where, getDocs, doc, serverTimestamp } from 'firebase/firestore';

const SUBSCRIBERS_COLLECTION = 'subscribers';

export interface Subscriber {
  id?: string;
  email: string;
  name: string;
  subscribedAt: any; // Firestore timestamp
}

export async function subscribeToNotifications(email: string, name: string): Promise<void> {
  // Check if already subscribed
  const isSubscribed = await isEmailSubscribed(email);
  if (isSubscribed) {
    return; // Already subscribed
  }

  await addDoc(collection(db, SUBSCRIBERS_COLLECTION), {
    email,
    name,
    subscribedAt: serverTimestamp()
  });
}

export async function unsubscribeFromNotifications(email: string): Promise<void> {
  const q = query(
    collection(db, SUBSCRIBERS_COLLECTION),
    where('email', '==', email)
  );
  
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (docSnapshot) => {
    await deleteDoc(doc(db, SUBSCRIBERS_COLLECTION, docSnapshot.id));
  });
}

export async function isEmailSubscribed(email: string): Promise<boolean> {
  const q = query(
    collection(db, SUBSCRIBERS_COLLECTION),
    where('email', '==', email)
  );
  
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function getAllSubscribers(): Promise<Subscriber[]> {
  const querySnapshot = await getDocs(collection(db, SUBSCRIBERS_COLLECTION));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Subscriber));
} 