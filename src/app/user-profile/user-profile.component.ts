import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { ReminderService } from '../services/reminder.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private reminderService: ReminderService
  ) {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      notifications: ['enabled'],
      dailyRemindersEnabled: [true],
      reminderTime: ['08:00'],
      contactMethod: ['email']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

      if (user) {
        this.profileForm.patchValue({
          username: user.displayName || '',
          email: user.email || ''
        });

        // ✅ FIXED: Now passing UID to the method
        this.reminderService.getReminderSettings(user.uid).then((prefs) => {
          if (prefs) {
            this.profileForm.patchValue({
              dailyRemindersEnabled: prefs.dailyRemindersEnabled,
              reminderTime: prefs.reminderTime,
              contactMethod: prefs.contactMethod
            });
          }
        }).catch((error) => {
          console.warn('No reminder settings found or error:', error);
        });
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      const { username, email, dailyRemindersEnabled, reminderTime, contactMethod } = this.profileForm.value;

      this.authService.updateUserProfile(username, email)
        .then(() => {
          return this.reminderService.saveReminderSettings({
            dailyRemindersEnabled,
            reminderTime,
            contactMethod
          });
        })
        .then(() => {
          this.successMessage = '✅ Profile and reminder settings updated!';
          this.errorMessage = '';
        })
        .catch((error) => {
          console.error('Error:', error);
          this.errorMessage = error.message || 'Failed to save changes.';
          this.successMessage = '';
        });
    }
  }

  toggleDarkMode(): void {
    document.body.classList.toggle('dark');
  }
}
