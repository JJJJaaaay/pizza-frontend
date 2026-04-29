import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9_]+$')
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6), 
        Validators.maxLength(100),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$')
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validator: this.passwordMatchValidator 
    });
  }

  passwordMatchValidator(g: FormGroup): ValidationErrors | null {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get f() { return this.registerForm.controls; }

  hasMinLength(): boolean {
    const password = this.f['password']?.value;
    return password ? password.length >= 6 : false;
  }

  hasLowercase(): boolean {
    const password = this.f['password']?.value;
    return password ? /[a-z]/.test(password) : false;
  }

  hasUppercase(): boolean {
    const password = this.f['password']?.value;
    return password ? /[A-Z]/.test(password) : false;
  }

  hasNumber(): boolean {
    const password = this.f['password']?.value;
    return password ? /[0-9]/.test(password) : false;
  }

  getPasswordStrength(): string {
    const password = this.f['password']?.value;
    if (!password) return '';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength === 'weak') return 'Weak password - use more variety';
    if (strength === 'medium') return 'Medium password - getting better!';
    if (strength === 'strong') return 'Strong password! Great choice!';
    return '';
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.registerForm.invalid) {
      if (this.f['username'].errors?.['required']) {
        Swal.fire('Validation Error', 'Username is required!', 'error');
      } else if (this.f['username'].errors?.['minlength']) {
        Swal.fire('Validation Error', 'Username must be at least 3 characters!', 'error');
      } else if (this.f['username'].errors?.['pattern']) {
        Swal.fire('Validation Error', 'Username can only contain letters, numbers, and underscore!', 'error');
      } else if (this.f['email'].errors?.['required']) {
        Swal.fire('Validation Error', 'Email is required!', 'error');
      } else if (this.f['email'].errors?.['email']) {
        Swal.fire('Validation Error', 'Please enter a valid email address!', 'error');
      } else if (this.f['password'].errors?.['required']) {
        Swal.fire('Validation Error', 'Password is required!', 'error');
      } else if (this.f['password'].errors?.['minlength']) {
        Swal.fire('Validation Error', 'Password must be at least 6 characters!', 'error');
      } else if (this.f['password'].errors?.['pattern']) {
        Swal.fire('Validation Error', 'Password must contain uppercase, lowercase, and number!', 'error');
      } else if (this.registerForm.errors?.['mismatch']) {
        Swal.fire('Validation Error', 'Passwords do not match!', 'error');
      }
      return;
    }
    
    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        Swal.fire({
          title: '🎉 Registration Successful!',
          text: 'Your account has been created. Redirecting...',
          icon: 'success',
          confirmButtonColor: '#4caf50',
          confirmButtonText: 'Continue',
          timer: 2000,
          showConfirmButton: true
        }).then(() => {
          this.router.navigate(['/pizzas']);
        });
      },
      error: (error) => {
        Swal.fire({
          title: 'Registration Failed!',
          text: error.error?.message || 'Could not create account. Please try again.',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'Try Again'
        });
        this.loading = false;
      }
    });
  }
}