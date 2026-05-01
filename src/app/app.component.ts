import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from './services/auth.services';

@Component({
  selector: 'app-root',
  template: `
    <p-menubar [model]="menuItems" styleClass="pizza-navbar">
      <ng-template pTemplate="start">
        <span class="nav-brand">🍕 Chel's Pizza</span>
      </ng-template>
      <ng-template pTemplate="end">
        <div class="flex align-items-center gap-2">
          <span *ngIf="isLoggedIn" class="username-badge">
            👤 {{ username }}
          </span>
          <button pButton 
                  *ngIf="isLoggedIn" 
                  icon="pi pi-sign-out" 
                  label="Logout" 
                  class="p-button-text p-button-sm logout-btn"
                  (click)="logout()">
          </button>
        </div>
      </ng-template>
    </p-menubar>
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .username-badge {
      color: #f4a261;
      margin-right: 0.5rem;
      font-weight: 500;
    }
    .logout-btn {
      color: #e63946 !important;
    }
    .logout-btn:hover {
      background: rgba(230, 57, 70, 0.1) !important;
    }
  `]
})
export class AppComponent {
  menuItems: MenuItem[] = [];
  isLoggedIn = false;
  username = '';

  constructor(private authService: AuthService) {
    this.authService.isAuthenticated$.subscribe(status => {
      this.isLoggedIn = status;
      const user = this.authService.getCurrentUser();
      this.username = user?.username || '';
      
      
      this.menuItems = [
        { label: 'Pizzas', icon: 'pi pi-home', routerLink: '/pizzas' },
        { label: 'Ingredients', icon: 'pi pi-list', routerLink: '/ingredients' },
      ];
    });
  }

  logout(): void {
  this.authService.logout();
}
}