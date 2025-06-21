import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  DocumentData
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface TrackedMedication {
  id?: string; // ✅ Needed for document reference
  name: string;
  rxcui: string;
  description: string;
  addedAt: any; // Timestamp or Date
  frequency: string;
}

@Injectable({ providedIn: 'root' })
export class TrackingService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  /** ✅ Add a medication to the current user's tracking list */
  addTrackedMedication(med: TrackedMedication): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return Promise.reject('User not logged in');

    const ref = collection(this.firestore, `users/${user.uid}/trackedMedications`);
    return addDoc(ref, {
      ...med,
      addedAt: new Date()
    }).then(() => {});
  }

  /** 📥 Get the current user's tracked medications as a stream */
  getTrackedMedications(): Observable<TrackedMedication[]> {
    return new Observable<TrackedMedication[]>(subscriber => {
      this.auth.onAuthStateChanged(user => {
        if (user) {
          const ref = collection(this.firestore, `users/${user.uid}/trackedMedications`);
          const obs$ = collectionData(ref, { idField: 'id' }) as Observable<TrackedMedication[]>;
          obs$.subscribe({
            next: meds => subscriber.next(meds),
            error: err => subscriber.error(err),
            complete: () => subscriber.complete()
          });
        } else {
          subscriber.next([]);
          subscriber.complete();
        }
      });
    });
  }

  /** 🗑️ Remove a medication by document ID */
  removeMedication(medId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return Promise.reject('User not logged in');

    const docRef = doc(this.firestore, `users/${user.uid}/trackedMedications/${medId}`);
    return deleteDoc(docRef);
  }

  /** 🔁 Check if a medication with the same RxCUI is already tracked */
  async isMedicationTracked(rxcui: string): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    const ref = collection(this.firestore, `users/${user.uid}/trackedMedications`);
    const q = query(ref, where('rxcui', '==', rxcui));
    const snapshot = await getDocs(q);
    return !snapshot.empty; // ✅ correct usage
  }
}
