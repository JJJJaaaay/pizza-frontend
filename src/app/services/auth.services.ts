import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.model';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  
  private TOKEN_KEY = 'jwt_token';
  private USER_KEY = 'user_data';
  private EXPIRY_KEY = 'token_expiry';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredSession();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.createSession(response);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.createSession(response);
          }
        })
      );
  }

  logout(): void {
    Swal.fire({
      title: 'Logged Out',
      text: 'You have been successfully logged out.',
      icon: 'info',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
      timer: 2000
    });
    this.destroySession();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    if (expiry && new Date(expiry) < new Date()) {
      this.destroySession();
      return false;
    }
    return true;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  getSessionRemaining(): number {
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    if (!expiry) return 0;
    const remaining = new Date(expiry).getTime() - new Date().getTime();
    return Math.max(0, Math.floor(remaining / 60000));
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  private createSession(authResult: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    
    const user: User = {
      id: 0,
      username: authResult.username,
      email: authResult.email,
      role: authResult.role,
      isActive: true
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.EXPIRY_KEY, new Date(authResult.expiresAt).toISOString());
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private destroySession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private loadStoredSession(): void {
    const user = this.getCurrentUser();
    if (user && this.isLoggedIn()) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }
}