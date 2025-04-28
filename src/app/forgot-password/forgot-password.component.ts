import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  message: string = '';
  error: string = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    this.message = '';
    this.error = '';

    if (this.form.invalid) {
      this.error = 'Please enter a valid email.';
      return;
    }

    try {
      await this.auth.sendPasswordReset(this.form.value.email);
      this.message = '✅ Password reset email sent. Please check your inbox.';
      this.form.reset();
    } catch (err) {
      console.error('Password Reset Error:', err);
      this.error = '❌ Failed to send reset email. Try again later.';
    }
  }
}
