import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ContentTypeHelper } from '../../Utils/content-type.helper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';

/**
 * Interface for Content filter state
 * Uses index signature to support dynamic category keys from ContentTypeHelper
 */
export interface ContentFilter {
  searchTerm: string;
  categories: {
    [key: string]: boolean;
  };
}

/**
 * Filter category configuration interface
 * Matches structure returned by ContentTypeHelper.getFilterCategories()
 */
interface FilterCategory {
  key: string;
  icon: string;
  translationKey: string;
}

@Component({
  selector: 'tc-content-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    TranslocoModule
  ],
  template: `
    <div class="content-filter-container" *transloco="let t; read: 'content-filter'">
      <mat-form-field appearance="outline" class="search-input">
        <mat-label>{{ t('search') }}</mat-label>
        <input 
          matInput 
          type="text" 
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearchChange($event)"
          placeholder="{{ t('searchPlaceholder') }}">
        <button 
          *ngIf="searchTerm" 
          matSuffix 
          mat-icon-button 
          aria-label="Clear" 
          (click)="clearSearch()">
          <mat-icon>close</mat-icon>
        </button>
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
      
      <div class="filter-buttons">
        <ng-container *ngFor="let category of filterCategories">
          <button 
            mat-icon-button
            [class.active]="filter.categories[category.key]"
            (click)="toggleCategory(category.key)"
            [matTooltip]="t(category.translationKey)">
            <mat-icon>{{ category.icon }}</mat-icon>
          </button>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .content-filter-container {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      gap: 8px;
      
      @media (max-width: 600px) {
        flex-direction: column;
        align-items: stretch;
      }
    }
    
    .search-input {
      flex: 1;
      min-width: 200px;
      margin: 10px 0px 0px 0px
    }
    
    .filter-buttons {
      display: flex;
      gap: 8px;
      
      @media (max-width: 600px) {
        justify-content: space-between;
      }
    }
    
    .active {
      color: var(--mdc-fab-container-color, var(--mdc-theme-secondary, #018786));
    }
  `]
})
export class ContentFilterComponent implements OnInit, OnDestroy {
  /**
   * Initial filter configuration (optional)
   */
  @Input() initialFilter?: Partial<ContentFilter>;
  
  /**
   * Event emitted when filter state changes
   */
  @Output() filterChange = new EventEmitter<ContentFilter>();
  
  /**
   * Filter categories from ContentTypeHelper
   */
  filterCategories: FilterCategory[] = ContentTypeHelper.getFilterCategories();
  
  /**
   * Current search term
   */
  searchTerm = '';
  
  /**
   * Current filter state with dynamic initialization of categories
   */
  filter: ContentFilter = {
    searchTerm: '',
    categories: this.initializeCategoriesObject()
  };
  
  /**
   * Subject for search term debouncing
   */
  private searchTerms = new Subject<string>();
  
  /**
   * Subject for cleanup on component destruction
   */
  private destroy$ = new Subject<void>();
  
  /**
   * Initialize component
   */
  ngOnInit(): void {
    // Apply initial filter if provided
    if (this.initialFilter) {
      if (this.initialFilter.searchTerm) {
        this.searchTerm = this.initialFilter.searchTerm;
        this.filter.searchTerm = this.initialFilter.searchTerm;
      }
      
      if (this.initialFilter.categories) {
        this.filter.categories = {
          ...this.filter.categories,
          ...this.initialFilter.categories
        };
      }
    }
    
    // Emit initial filter state
    this.filterChange.emit(this.filter);
    
    // Setup search debounce
    this.searchTerms.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.filter.searchTerm = term;
      this.filterChange.emit(this.filter);
    });
  }
  
  /**
   * Cleanup subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Initialize categories object dynamically based on available filter categories
   * @returns Object with all category keys set to false
   */
  private initializeCategoriesObject(): { [key: string]: boolean } {
    const categories: { [key: string]: boolean } = {};
    
    // Get available categories from helper and set each to false initially
    this.filterCategories.forEach(category => {
      categories[category.key] = false;
    });
    
    return categories;
  }
  
  /**
   * Handle search term changes
   * @param term The new search term
   */
  onSearchChange(term: string): void {
    this.searchTerms.next(term);
  }
  
  /**
   * Clear search input
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.searchTerms.next('');
  }
  
  /**
   * Toggle a filter category
   * @param category The category key to toggle
   */
  toggleCategory(category: string): void {
    this.filter.categories[category] = !this.filter.categories[category];
    this.filterChange.emit(this.filter);
  }
}