import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';


import { MenubarModule } from 'primeng/menubar';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';


import { TokenInterceptor } from './services/token.interceptor';
import { AuthGuard } from './guards/auth.guard';


import { AppComponent } from './app.component';
import { PizzaListComponent } from './pizzas/pizza-list.component';
import { IngredientListComponent } from './ingredients/ingredient-list.component';
import { LoginComponent } from './components/login/login.components';
import { RegisterComponent } from './components/register/register.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'pizzas', component: PizzaListComponent, canActivate: [AuthGuard] },
  { path: 'ingredients', component: IngredientListComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [
    AppComponent,
    PizzaListComponent,
    IngredientListComponent,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    MenubarModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, InputTextareaModule, InputNumberModule,
    DropdownModule, TagModule, ChipModule, ToastModule,
    ConfirmDialogModule, InputSwitchModule, DividerModule,
    TooltipModule, ProgressSpinnerModule, BadgeModule,
  ],
  providers: [
    MessageService, 
    ConfirmationService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}