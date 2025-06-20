import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';
import { Drug } from '../models/drug.model';
import { TrackingService } from '../services/tracking.service'; // 👈 Add this

@Component({
  selector: 'app-dosage-correction',
  standalone: true,
  templateUrl: './dosage-correction.component.html',
  styleUrls: ['./dosage-correction.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class DosageCorrectionComponent implements OnInit {
  correctionForm: FormGroup;
  submitted = false;
  allDrugs: Drug[] = [];

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private toastService: ToastService,
    private trackingService: TrackingService // 👈 Inject service
  ) {
    this.correctionForm = this.fb.group({
      drug: [null, Validators.required],
      medicationName: [{ value: '', disabled: true }],
      dosage: ['', Validators.required],
      notes: ['']
    });

    this.correctionForm.get('drug')?.valueChanges.subscribe((drug: any) => {
      this.correctionForm.patchValue({ medicationName: drug?.name || '' });
    });
  }

  ngOnInit(): void {
    this.trackingService.getTrackedMedications().subscribe((drugs) => {
      this.allDrugs = drugs;
    });
  }

  async onSubmit() {
    if (this.correctionForm.invalid) return;

    const formValue = this.correctionForm.getRawValue();

    try {
      const ref = collection(this.firestore, 'dosageCorrections');
      await addDoc(ref, {
        drug: formValue.drug,
        medicationName: formValue.medicationName,
        dosage: formValue.dosage,
        notes: formValue.notes,
        createdAt: serverTimestamp()
      });

      this.toastService.show('✅ Dosage correction submitted!', { type: 'success' });
      this.submitted = true;
      this.correctionForm.reset();
    } catch (err) {
      console.error('Error submitting correction:', err);
      this.toastService.show('⚠️ Submission failed. Try again later.', { type: 'error' });
    }
  }
}
