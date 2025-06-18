// src/app/services/reminder.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  collectionData,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Reminder {
  id?: string;
  medicationName: string;
  time: string; // e.g., "08:00 AM"
  daysOfWeek: string[]; // e.g., ["Mon", "Tue", "Wed"]
}

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  // 🔄 Save user-wide reminder preferences (original)
  async saveReminderSettings(settings: any): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const docRef = doc(this.firestore, `reminders/${user.uid}`);
    await setDoc(docRef, settings, { merge: true });
  }

  // 🔍 Load reminder preferences for a given user
  async getReminderSettings(uid: string): Promise<any> {
    const docRef = doc(this.firestore, `reminders/${uid}`);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  // ✅ Get all reminders scheduled for today
  getTodaysReminders(): Observable<Reminder[]> {
    const user = this.auth.currentUser;
    if (!user) {
      return new Observable<Reminder[]>(subscriber => {
        subscriber.next([]);
        subscriber.complete();
      });
    }

    const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
    const remindersRef = collection(this.firestore, `users/${user.uid}/reminders`);

    return (collectionData(remindersRef, { idField: 'id' }) as Observable<Reminder[]>).pipe(
      map((reminders: Reminder[]) =>
        reminders.filter(r => r.daysOfWeek.includes(today))
      )
    );
  }
} // 👈✅ This was missing!
