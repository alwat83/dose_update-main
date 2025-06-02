import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // ✅ Add RouterModule here
import { AuthService } from '../auth/auth.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule] // ✅ Include RouterModule here
})
export class LoginComponent implements AfterViewInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  showResend: boolean = false;
  unverifiedUser: User | null = null;
  resendSuccessMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private elRef: ElementRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngAfterViewInit(): void {
    const card = this.elRef.nativeElement.querySelector('.card');
    if (card) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            card.classList.add('in-view');
            observer.unobserve(card);
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(card);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.resendSuccessMessage = '';
    this.showResend = false;

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password)
        .then((credential) => {
          const user = credential.user;
          if (user.emailVerified) {
            this.router.navigate(['/dashboard']);
          } else {
            this.unverifiedUser = user;
            this.showResend = true;
            this.errorMessage = '📩 Please verify your email address before logging in.';
            this.authService.logout();
          }
        })
        .catch(error => {
          this.errorMessage = error.message || 'An error occurred during login.';
        });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  resendVerification(): void {
    if (this.unverifiedUser) {
      this.authService.sendVerificationEmail(this.unverifiedUser)
        .then(() => {
          this.resendSuccessMessage = '✅ Verification email resent. Please check your inbox.';
          this.showResend = false;
        })
        .catch(err => {
          this.errorMessage = '⚠️ Failed to resend email. Try again later.';
        });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
