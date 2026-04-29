import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.services';
import Swal from 'sweetalert2';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    let authReq = req;
    if (token && !req.url.includes('/auth/')) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const message = error.error?.message || 'Your session has expired. Please login again.';
          
          Swal.fire({
            title: 'Session Expired',
            text: message,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          }).then(() => {
            // Gamitin ang expireSession — hindi logout
            // para hindi lumabas ang "Logged Out" message
            this.authService.expireSession();
          });
        }
        return throwError(() => error);
      })
    );
  }
}