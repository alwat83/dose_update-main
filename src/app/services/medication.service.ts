// src/app/services/medication.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, CollectionReference, DocumentData } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class MedicationService {
  private medCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.medCollection = collection(this.firestore, 'medications');
  }

  // ✅ Add medication data to Firestore
  async saveMedication(data: any): Promise<void> {
    try {
      await addDoc(this.medCollection, {
        ...data,
        savedAt: new Date().toISOString()
      });
      console.log('✅ Medication saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving medication:', error);
    }
  }
}
