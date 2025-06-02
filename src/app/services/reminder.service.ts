import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  // Save reminder settings to Firestore
  async saveReminderSettings(settings: any): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const docRef = doc(this.firestore, `reminders/${user.uid}`);
    await setDoc(docRef, settings, { merge: true });
  }

  // ✅ Updated to accept uid
  async getReminderSettings(uid: string): Promise<any> {
    const docRef = doc(this.firestore, `reminders/${uid}`);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
  }
}
