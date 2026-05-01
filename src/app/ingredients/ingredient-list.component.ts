import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IngredientService, Ingredient } from '../services/api.service';

@Component({
  selector: 'app-ingredient-list',
  templateUrl: './ingredient-list.component.html',
})
export class IngredientListComponent implements OnInit {
  ingredients: Ingredient[] = [];
  loading = false;

  dialogVisible = false;
  editMode = false;
  form: Partial<Ingredient> = {};

  categories = ['Cheese', 'Meat', 'Veggie', 'Sauce', 'Dough', 'Seafood', 'Other'];
  units = ['g', 'kg', 'ml', 'l', 'pcs', 'tbsp', 'tsp'];

  constructor(
    private svc: IngredientService,
    private confirm: ConfirmationService,
    private toast: MessageService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: data => { this.ingredients = data; this.loading = false; },
      error: () => { this.loading = false; this.toast.add({ severity: 'error', summary: 'Error', detail: 'Cannot connect to API.' }); }
    });
  }

  openCreateDialog(): void {
    this.editMode = false;
    this.form = { isActive: true, stockQuantity: 0, unit: 'g', category: 'Other' };
    this.dialogVisible = true;
  }

  openEditDialog(ing: Ingredient): void {
    this.editMode = true;
    this.form = { ...ing };
    this.dialogVisible = true;
  }

  save(): void {
    if (!this.form.name?.trim()) {
      this.toast.add({ severity: 'warn', summary: 'Validation', detail: 'Ingredient name is required.' });
      return;
    }
    const call = (this.editMode && this.form.id)
      ? this.svc.update(this.form.id, this.form)
      : this.svc.create(this.form);

    call.subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: this.editMode ? 'Updated!' : 'Created!', detail: `${this.form.name} saved.` });
        this.dialogVisible = false;
        this.load();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Save failed.' })
    });
  }

  confirmDelete(ing: Ingredient): void {
    this.confirm.confirm({
      message: `Delete <strong>${ing.name}</strong>? This may affect pizzas that use it.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.svc.delete(ing.id).subscribe({
          next: () => { this.toast.add({ severity: 'warn', summary: 'Deleted', detail: `${ing.name} removed.` }); this.load(); },
          error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed. Ingredient may be in use.' })
        });
      }
    });
  }

  
  getStockSeverity(stock: number): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    if (stock <= 0) return 'danger';
    if (stock < 50) return 'warning';
    if (stock < 200) return 'info';
    return 'success';
  }

  getStockStatus(stock: number): string {
    if (stock <= 0) return 'Out of Stock';
    if (stock < 50) return 'Low Stock';
    if (stock < 200) return 'In Stock';
    return 'Well Stocked';
  }

  getCategorySeverity(cat: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    const map: Record<string, "success" | "secondary" | "info" | "warning" | "danger" | "contrast"> = {
      'Cheese': 'warning',
      'Meat': 'danger',
      'Veggie': 'success',
      'Sauce': 'info',
      'Dough': 'secondary',
      'Seafood': 'info'
    };
    return map[cat] ?? 'secondary';
  }
}