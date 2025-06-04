import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, getDocs, query, orderBy, where, Timestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.scss']
})
export class TrackerComponent implements OnInit {
  trackerForm: FormGroup;
  doseLogs: any[] = [];
  loading = false;

  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private fb = inject(FormBuilder);

  constructor() {
    this.trackerForm = this.fb.group({
      medication: '',
      timestamp: new Date().toISOString().slice(0, 16)
    });
  }

  async ngOnInit() {
    await this.fetchLogs();
  }

  async logDose() {
    if (!this.auth.currentUser) return;

    this.loading = true;

    const data = {
      userId: this.auth.currentUser.uid,
      medication: this.trackerForm.value.medication,
      timestamp: Timestamp.fromDate(new Date(this.trackerForm.value.timestamp))
    };

    try {
      await addDoc(collection(this.firestore, 'medicationLogs'), data);
      this.trackerForm.reset({ timestamp: new Date().toISOString().slice(0, 16) });
      await this.fetchLogs();
    } catch (err) {
      console.error('Error logging dose:', err);
    }

    this.loading = false;
  }

  async fetchLogs() {
    if (!this.auth.currentUser) return;

    const logsRef = collection(this.firestore, 'medicationLogs');
    const q = query(
      logsRef,
      where('userId', '==', this.auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    this.doseLogs = querySnapshot.docs.map(doc => doc.data());
  }
}
