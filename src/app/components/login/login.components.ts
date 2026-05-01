import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  get f() { return this.loginForm.controls; }

  ngOnInit(): void {
    
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/pizzas']);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.loginForm.invalid) {
      if (this.f['username'].errors?.['required']) {
        Swal.fire({
          title: 'Walang ganyan sa database ko ya',
          text: 'Username is required!',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      } else if (this.f['username'].errors?.['minlength']) {
        Swal.fire({
          title: 'Validation Error',
          text: 'Username must be at least 3 characters!',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      } else if (this.f['password'].errors?.['required']) {
        Swal.fire({
          title: 'Validation Error',
          text: 'Password is required!',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      } else if (this.f['password'].errors?.['minlength']) {
        Swal.fire({
          title: 'Validation Error',
          text: 'Password must be at least 4 characters!',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      }
      return;
    }

    this.loading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Welcome Back!',
          text: `Successfully logged in as ${response.username}`,
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
          title: 'Login Failed!',
          text: error.error?.message || 'Invalid username or password. Please try again.',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'Try Again'
        });
        this.loading = false;
      }
    });
  }
}