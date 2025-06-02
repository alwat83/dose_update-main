import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { collection, addDoc, getFirestore } from '@angular/fire/firestore';
import { Auth, getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
  requestForm: FormGroup;
  toastMessage: string = '';
  showConfirmModal: boolean = false;

  private db = getFirestore();
  private auth: Auth = getAuth();

  constructor(private fb: FormBuilder) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      reason: ['']
    });

    // 👤 Prefill user email if logged in
    const user = this.auth.currentUser;
    if (user?.email) {
      this.requestForm.patchValue({ email: user.email });
    }
  }

  onDeleteRequest(): void {
    if (this.requestForm.invalid) return;
    this.showConfirmModal = true;
  }

  async confirmRequest(): Promise<void> {
    const { email, reason } = this.requestForm.value;

    try {
      await addDoc(collection(this.db, 'deletionRequests'), {
        email,
        reason,
        timestamp: new Date().toISOString()
      });

      this.toastMessage = '✅ Your deletion request has been received.';
      this.requestForm.reset();
    } catch (error) {
      console.error('❌ Firestore error:', error);
      this.toastMessage = '❌ Failed to submit request. Try again later.';
    }

    this.showConfirmModal = false;

    setTimeout(() => (this.toastMessage = ''), 5000);
  }

  cancelRequest(): void {
    this.showConfirmModal = false;
  }
}
