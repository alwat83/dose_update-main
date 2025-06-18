// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TrackingService, TrackedMedication } from '../services/tracking.service';
import { ReminderService, Reminder } from '../services/reminder.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  trackedMedications$!: Observable<TrackedMedication[]>;
  todaysReminders: Reminder[] = [];

  constructor(
    private trackingService: TrackingService,
    private reminderService: ReminderService
  ) {}

  ngOnInit(): void {
    this.trackedMedications$ = this.trackingService.getTrackedMedications();

    this.reminderService.getTodaysReminders().subscribe(reminders => {
      this.todaysReminders = reminders;
    });
  }
}
