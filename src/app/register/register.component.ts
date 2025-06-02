import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements AfterViewInit {
  registerForm: FormGroup;
  @ViewChild('cardRef') cardRef!: ElementRef;

  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        birthDate: ['', [Validators.required, this.validateAge]],
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.mustMatchValidator }
    );
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && this.cardRef?.nativeElement) {
        this.cardRef.nativeElement.classList.add('in-view');
        observer.disconnect();
      }
    }, { threshold: 0.3 });

    if (this.cardRef?.nativeElement) {
      observer.observe(this.cardRef.nativeElement);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      this.authService.signUp(email, password)
        .then(userCredential => {
          return this.authService.sendVerificationEmail(userCredential.user).then(() => {
            this.successMessage = '📧 Verification email sent! Please check your inbox.';
            this.errorMessage = '';
            this.router.navigate(['/login']);
          });
        })
        .catch(error => {
          console.error('❌ Firebase Registration Error:', error);
          this.errorMessage = error.message || 'Registration failed.';
        });
        
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  validateAge(control: FormControl): ValidationErrors | null {
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18 ? { underage: true } : null;
  }

  mustMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mustMatch: true };
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}
