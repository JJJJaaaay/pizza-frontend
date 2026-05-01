import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';



export interface Ingredient {
  id: number;
  name: string;
  category: string;
  unit: string;
  stockQuantity: number;
  isActive: boolean;
}

export interface PizzaIngredient {
  pizzaId: number;
  ingredientId: number;
  ingredient: Ingredient;
  quantity: number;
}

export interface Pizza {
  id: number;
  name: string;
  description: string;
  price: number;
  size: string;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
  pizzaIngredients: PizzaIngredient[];
}



@Injectable({ providedIn: 'root' })
export class PizzaService {
  private base = `${environment.apiUrl}/api/Pizzas`;  
  constructor(private http: HttpClient) {}

  getAll(): Observable<Pizza[]> {
    return this.http.get<Pizza[]>(this.base);
  }
  
  getById(id: number): Observable<Pizza> {
    return this.http.get<Pizza>(`${this.base}/${id}`);
  }
  
  create(p: Partial<Pizza>): Observable<Pizza> {
    return this.http.post<Pizza>(this.base, p);
  }
  
  update(id: number, p: Partial<Pizza>): Observable<Pizza> {
    return this.http.put<Pizza>(`${this.base}/${id}`, p);
  }
  
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  addIngredient(pizzaId: number, ingredientId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.base}/${pizzaId}/ingredients`, { ingredientId, quantity });
  }
  
  removeIngredient(pizzaId: number, ingredientId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${pizzaId}/ingredients/${ingredientId}`);
  }
}



@Injectable({ providedIn: 'root' })
export class IngredientService {
  private base = `${environment.apiUrl}/api/Ingredients`;  
  constructor(private http: HttpClient) {}

  getAll(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(this.base);
  }
  
  getById(id: number): Observable<Ingredient> {
    return this.http.get<Ingredient>(`${this.base}/${id}`);
  }
  
  create(i: Partial<Ingredient>): Observable<Ingredient> {
    return this.http.post<Ingredient>(this.base, i);
  }
  
  update(id: number, i: Partial<Ingredient>): Observable<Ingredient> {
    return this.http.put<Ingredient>(`${this.base}/${id}`, i);
  }
  
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}