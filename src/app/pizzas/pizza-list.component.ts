import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PizzaService, Pizza, IngredientService, Ingredient } from '../services/api.service';

@Component({
  selector: 'app-pizza-list',
  templateUrl: './pizza-list.component.html',
})
export class PizzaListComponent implements OnInit {
  pizzas: Pizza[] = [];
  allIngredients: Ingredient[] = [];
  loading = false;

  // Pizza dialog
  pizzaDialogVisible = false;
  editMode = false;
  form: Partial<Pizza> = {};
  sizes = ['Small', 'Medium', 'Large'];
  
  // Image preview
  imagePreviewError = false;

  // Ingredient manager dialog
  ingDialogVisible = false;
  selectedPizza: Pizza | null = null;
  newIngredientId: number | null = null;
  newQuantity: number = 100;

  get availableIngredients(): Ingredient[] {
    if (!this.selectedPizza) return this.allIngredients;
    const usedIds = this.selectedPizza.pizzaIngredients.map(pi => pi.ingredientId);
    // Only show ingredients that are:
    // 1. Not already used in the pizza
    // 2. Active
    // 3. Have stock quantity > 0
    return this.allIngredients.filter(i => 
      !usedIds.includes(i.id) && 
      i.isActive && 
      i.stockQuantity > 0
    );
  }

  // Helper method to check if ingredient has enough stock
  hasEnoughStock(ingredientId: number, requiredQuantity: number): boolean {
    const ingredient = this.allIngredients.find(i => i.id === ingredientId);
    if (!ingredient) return false;
    return ingredient.stockQuantity >= requiredQuantity;
  }

  // Get stock warning message
  getStockWarning(ingredientId: number, requiredQuantity: number): string {
    const ingredient = this.allIngredients.find(i => i.id === ingredientId);
    if (!ingredient) return 'Ingredient not found';
    if (ingredient.stockQuantity === 0) {
      return `❌ ${ingredient.name} is OUT OF STOCK! (0 ${ingredient.unit} available)`;
    }
    if (ingredient.stockQuantity < requiredQuantity) {
      return `⚠️ NOT ENOUGH ${ingredient.name}! Only ${ingredient.stockQuantity} ${ingredient.unit} available, but you need ${requiredQuantity} ${ingredient.unit}`;
    }
    return '';
  }

  // Get CSS class for stock status
  getStockClass(ingredientId: number): string {
    const ingredient = this.allIngredients.find(i => i.id === ingredientId);
    if (!ingredient) return '';
    if (ingredient.stockQuantity === 0) return 'out-of-stock';
    if (ingredient.stockQuantity < 50) return 'low-stock';
    return '';
  }

  constructor(
    private pizzaSvc: PizzaService,
    private ingSvc: IngredientService,
    private confirm: ConfirmationService,
    private toast: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPizzas();
    this.loadIngredients();
  }

  loadPizzas(): void {
    this.loading = true;
    this.pizzaSvc.getAll().subscribe({
      next: data => { 
        this.pizzas = data; 
        this.loading = false; 
      },
      error: () => { 
        this.loading = false; 
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Cannot connect to API. Is the backend running?' }); 
      }
    });
  }

  loadIngredients(): void {
    this.ingSvc.getAll().subscribe({
      next: data => this.allIngredients = data,
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load ingredients.' })
    });
  }

  openCreateDialog(): void {
    this.editMode = false;
    this.imagePreviewError = false;
    this.form = { 
      size: 'Medium', 
      isAvailable: true, 
      price: 0,
      name: '',
      description: '',
      imageUrl: ''
    };
    this.pizzaDialogVisible = true;
  }

  openEditDialog(pizza: Pizza): void {
    this.editMode = true;
    this.imagePreviewError = false;
    this.form = { ...pizza };
    this.pizzaDialogVisible = true;
  }

  savePizza(): void {
    if (!this.form.name?.trim()) {
      this.toast.add({ severity: 'warn', summary: 'Validation', detail: 'Pizza name is required.' });
      return;
    }
    if (this.editMode && this.form.id) {
      this.pizzaSvc.update(this.form.id, this.form).subscribe({
        next: () => { 
          this.toast.add({ severity: 'success', summary: 'Updated', detail: `${this.form.name} updated!` }); 
          this.pizzaDialogVisible = false; 
          this.loadPizzas(); 
        },
        error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update pizza.' })
      });
    } else {
      this.pizzaSvc.create(this.form).subscribe({
        next: () => { 
          this.toast.add({ severity: 'success', summary: 'Created', detail: `${this.form.name} added to the menu!` }); 
          this.pizzaDialogVisible = false; 
          this.loadPizzas(); 
        },
        error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create pizza.' })
      });
    }
  }

  confirmDelete(pizza: Pizza): void {
    this.confirm.confirm({
      message: `Are you sure you want to delete <strong>${pizza.name}</strong>?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.pizzaSvc.delete(pizza.id).subscribe({
          next: () => { 
            this.toast.add({ severity: 'warn', summary: 'Deleted', detail: `${pizza.name} removed.` }); 
            this.loadPizzas(); 
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete.' })
        });
      }
    });
  }

  toggleAvailability(pizza: Pizza): void {
    this.pizzaSvc.update(pizza.id, pizza).subscribe({
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update availability.' })
    });
  }

  openIngredientManager(pizza: Pizza): void {
    this.selectedPizza = pizza;
    this.newIngredientId = null;
    this.newQuantity = 100;
    this.ingDialogVisible = true;
  }

  addIngredient(): void {
    if (!this.selectedPizza || !this.newIngredientId) {
      this.toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please select an ingredient first.' });
      return;
    }
    
    // Find the selected ingredient
    const selectedIngredient = this.allIngredients.find(i => i.id === this.newIngredientId);
    
    // VALIDATION 1: Check if ingredient exists
    if (!selectedIngredient) {
      this.toast.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Ingredient not found!' 
      });
      return;
    }
    
    // VALIDATION 2: Check if ingredient is active
    if (!selectedIngredient.isActive) {
      this.toast.add({ 
        severity: 'error', 
        summary: 'Inactive Ingredient', 
        detail: `${selectedIngredient.name} is inactive and cannot be added to pizzas.` 
      });
      return;
    }
    
    // VALIDATION 3: Check if enough stock
    if (selectedIngredient.stockQuantity === 0) {
      this.toast.add({ 
        severity: 'error', 
        summary: '❌ OUT OF STOCK!', 
        detail: `${selectedIngredient.name} is completely out of stock! (0 ${selectedIngredient.unit} available)`,
        life: 5000
      });
      return;
    }
    
    // VALIDATION 4: Check if stock is insufficient
    if (selectedIngredient.stockQuantity < this.newQuantity) {
      this.toast.add({ 
        severity: 'error', 
        summary: '⚠️ NOT ENOUGH STOCK!', 
        detail: `${selectedIngredient.name} only has ${selectedIngredient.stockQuantity} ${selectedIngredient.unit} available, but you need ${this.newQuantity} ${selectedIngredient.unit}. Please reduce the quantity or restock first.`,
        life: 6000
      });
      return;
    }
    
    // VALIDATION 5: Check if quantity is valid
    if (this.newQuantity <= 0) {
      this.toast.add({ 
        severity: 'warn', 
        summary: 'Invalid Quantity', 
        detail: 'Please enter a valid quantity greater than 0.' 
      });
      return;
    }
    
    // All validations passed - add the ingredient
    this.pizzaSvc.addIngredient(this.selectedPizza.id, this.newIngredientId, this.newQuantity).subscribe({
      next: () => {
        this.toast.add({ 
          severity: 'success', 
          summary: '✅ Ingredient Added!', 
          detail: `Added ${this.newQuantity} ${selectedIngredient.unit} of ${selectedIngredient.name}. New stock: ${selectedIngredient.stockQuantity - this.newQuantity} ${selectedIngredient.unit} remaining.`,
          life: 4000
        });
        this.newIngredientId = null;
        this.newQuantity = 100;
        // Refresh the selected pizza's ingredients
        this.pizzaSvc.getById(this.selectedPizza!.id).subscribe(p => {
          this.selectedPizza = p;
          this.loadPizzas();
        });
        // Refresh ingredients list to update stock quantities
        this.loadIngredients();
      },
      error: (err) => {
        console.error('Add ingredient error:', err);
        this.toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to add ingredient. Please try again.' 
        });
      }
    });
  }

  removeIngredient(ingredientId: number): void {
    if (!this.selectedPizza) return;
    
    const ingredient = this.allIngredients.find(i => i.id === ingredientId);
    
    this.confirm.confirm({
      message: `Remove <strong>${ingredient?.name || 'this ingredient'}</strong> from ${this.selectedPizza.name}?`,
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.pizzaSvc.removeIngredient(this.selectedPizza!.id, ingredientId).subscribe({
          next: () => {
            this.toast.add({ 
              severity: 'info', 
              summary: 'Ingredient Removed', 
              detail: `${ingredient?.name || 'Ingredient'} removed from pizza.` 
            });
            this.pizzaSvc.getById(this.selectedPizza!.id).subscribe(p => {
              this.selectedPizza = p;
              this.loadPizzas();
            });
            // Refresh ingredients to update stock
            this.loadIngredients();
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove ingredient.' })
        });
      }
    });
  }

  getIngredientName(id: number): string {
    return this.allIngredients.find(i => i.id === id)?.name ?? '';
  }

  getSizeSeverity(size: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    if (size === 'Large') return 'danger';
    if (size === 'Medium') return 'warning';
    return 'success';
  }
}