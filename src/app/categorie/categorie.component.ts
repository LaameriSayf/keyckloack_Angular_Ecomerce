import { Component, OnInit } from '@angular/core';
import { CategorieProduit } from '../models/categorie';
import { CategorieService } from '../services/categorie.service';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.css']
})
export class CategorieComponent implements OnInit {
  categories: CategorieProduit[] = [];
  categorie: CategorieProduit = new CategorieProduit('', '');
  editCategorie: CategorieProduit | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showAddModal: boolean = false;
  searchText: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortColumn: string = 'nom';

  constructor(private categorieService: CategorieService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.categorieService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Erreur lors du chargement des catégories';
        this.isLoading = false;
        
        if (error.error?.text) {
          try {
            const cleanJson = this.cleanMalformedJson(error.error.text);
            this.categories = JSON.parse(cleanJson);
            this.errorMessage = null;
          } catch (e) {
            console.error('Échec du parsing:', e);
          }
        }
      }
    });
  }

  private cleanMalformedJson(dirtyJson: string): string {
    const firstBracket = dirtyJson.indexOf('[');
    const lastBracket = dirtyJson.lastIndexOf(']');
    return dirtyJson.substring(firstBracket, lastBracket + 1);
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  addCategorie(): void {
    if (!this.categorie.nom || !this.categorie.description) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.categorieService.addCategorie(this.categorie).subscribe({
      next: () => {
        this.successMessage = 'Catégorie ajoutée avec succès!';
        this.categorie = new CategorieProduit('', '');
        this.loadCategories();
        this.closeAddModal();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = "Erreur lors de l'ajout de la catégorie";
        this.isLoading = false;
      }
    });
  }

  deleteCategorie(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      this.isLoading = true;
      
      this.categorieService.deleteCategorie(id).subscribe({
        next: () => {
          this.successMessage = 'Catégorie supprimée avec succès!';
          this.loadCategories();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.errorMessage = 'Erreur lors de la suppression';
          this.isLoading = false;
        }
      });
    }
  }

  updateCategorie(): void {
    if (!this.editCategorie?.id) {
      this.errorMessage = 'Catégorie invalide pour modification';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.categorieService.updateCategorie(this.editCategorie.id, this.editCategorie).subscribe({
      next: () => {
        this.successMessage = 'Catégorie mise à jour avec succès!';
        this.editCategorie = null;
        this.loadCategories();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Erreur lors de la mise à jour';
        this.isLoading = false;
      }
    });
  }

  setEditCategorie(categorie: CategorieProduit): void {
    this.editCategorie = { ...categorie };
    this.errorMessage = null;
  }

  cancelEdit(): void {
    this.editCategorie = null;
  }

  dismissAlert(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }
  get filteredCategories(): CategorieProduit[] {
    let filtered = this.categories;
    
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(c => 
        c.nom.toLowerCase().includes(searchLower) || 
        (c.description && c.description.toLowerCase().includes(searchLower))
    )}
    
    return this.sortData(filtered);
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  private sortData(data: CategorieProduit[]): CategorieProduit[] {
    return [...data].sort((a, b) => {
      const valA = a[this.sortColumn as keyof CategorieProduit] || '';
      const valB = b[this.sortColumn as keyof CategorieProduit] || '';
      
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getRandomColor(): string {
    const colors = [
      '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', 
      '#e74a3b', '#6610f2', '#6f42c1', '#fd7e14'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}