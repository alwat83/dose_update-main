import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TrackingService, TrackedMedication } from '../services/tracking.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-tracking-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tracking-list.component.html',
  styleUrls: ['./tracking-list.component.scss']
})
export class TrackingListComponent implements OnInit {
  trackedMedications: TrackedMedication[] = [];
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private trackingService: TrackingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.trackingService.getTrackedMedications().subscribe({
      next: (meds) => {
        this.trackedMedications = meds;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load tracked medications.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  removeFromTracking(med: TrackedMedication): void {
    if (!med.id) {
      console.warn('No document ID found for this medication.');
      return;
    }

    this.trackingService.removeMedication(med.id).then(() => {
      this.trackedMedications = this.trackedMedications.filter(m => m.id !== med.id);
    }).catch(err => {
      console.error('Failed to remove medication:', err);
      this.errorMessage = 'Could not remove medication. Please try again.';
    });
  }
}
