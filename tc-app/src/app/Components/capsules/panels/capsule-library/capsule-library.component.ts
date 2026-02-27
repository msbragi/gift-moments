import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { isNumber, TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ConfirmDialogService } from '../../../../Features/confirm/confirm-dialog.service';
import { ContentFilter, ContentFilterComponent } from "../../../../Features/content-filter/content-filter.component";
import { ContentViewerService } from '../../../../Features/content-viewer/content-viewer.service';
import { DropUploadComponent } from '../../../../Features/drop-upload/drop-upload.component';
import { ExternalLinkService } from '../../../../Features/external-link';
import { ICapsule, ILibraryItem } from '../../../../Models/models.interface';
import { FileUploadEvent } from '../../../../Models/upload.model';
import { ItemsService } from '../../../../Services/api/items.service';
import { LibraryService } from '../../../../Services/api/library.service';
import { SnackbarService } from '../../../../Services/common/snackbar.service';
import { ContentTypeHelper } from '../../../../Utils/content-type.helper';
import { PanelViewToggleComponent, ViewToggleOptions, ViewToggleType } from '../shared/elements/panel-view-toggle.component';
import { CapsuleLibraryCardComponent } from './capsule-library-card.component';
import { CapsuleLibraryTableComponent } from './capsule-library-table.component';
import { CapsulesUIRefreshService } from '../../capsules-ui-refresh.service';

@Component({
  selector: 'tc-capsule-library',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    TranslocoModule,
    DropUploadComponent,
    PanelViewToggleComponent,
    CapsuleLibraryTableComponent,
    CapsuleLibraryCardComponent,
    ContentFilterComponent
  ],
  templateUrl: './capsule-library.component.html',
  styleUrl: '../shared/templates/items-template.scss',
})
export class CapsuleLibraryComponent implements OnInit, OnDestroy {
  // Current capsule
  @Input() currentCapsule: ICapsule | null = null;
  
  // Raw library items stream
  private libraryItems$ = new BehaviorSubject<ILibraryItem[]>([]);
  
  // Current filter state
  private currentFilter$ = new BehaviorSubject<ContentFilter>({
    searchTerm: '',
    categories: {}
  });
  
  // Filtered items stream (combine raw items with filter)
  items$: Observable<ILibraryItem[]>;

  private subscription = new Subscription();

  viewToggleMode: ViewToggleType = 'grid';
  saveToggleMode: ViewToggleType = 'grid';
  viewToggleConfig: ViewToggleOptions = {
    visible: {
      upload: true,
      link: true,
      divider: true,
      grid: true,
      list: true,
    }
  };

  constructor(
    private libraryService: LibraryService,
    private itemsService: ItemsService,
    private confirmService: ConfirmDialogService,
    private contentViewerService: ContentViewerService,
    private translocoService: TranslocoService,
    private externalLinkService: ExternalLinkService,
    private snackbarService: SnackbarService,
    private UIRefreshService: CapsulesUIRefreshService
  ) {
    // Set up the filtered items stream by combining the raw items with the current filter
    this.items$ = combineLatest([
      this.libraryItems$,
      this.currentFilter$
    ]).pipe(
      map(([items, filter]) => this.applyFilter(items, filter))
    );
  }

  ngOnInit(): void {
    this.refreshItems();
  }

  /**
   * Clean up subscriptions when component is destroyed
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Apply filter criteria to library items
   * @param items Items to filter
   * @param filter Filter criteria
   * @returns Filtered items array
   */
  private applyFilter(items: ILibraryItem[], filter: ContentFilter): ILibraryItem[] {
    // If no filter is active, return all items
    if (!filter.searchTerm && !Object.values(filter.categories).some(v => v)) {
      return items;
    }
    
    return items.filter(item => {
      // Filter by search term (if provided)
      let matchesSearch = true;
      if(item.name) {
        matchesSearch = !filter.searchTerm || 
          item.name.toLowerCase().includes(filter.searchTerm.toLowerCase());
      }
      
      if (!matchesSearch) return false;
      
      // Check if any category filter is active
      const anyCategorySelected = Object.values(filter.categories).some(value => value);
      if (!anyCategorySelected) return true;
      
      // Filter by category
      const category = ContentTypeHelper.getCategory(item);
      return filter.categories[category];
    });
  }

  /**
   * Load Library items
   */
  refreshItems(): void {
    const sub = this.libraryService.getAllLibraryItems().pipe(
      tap((items: ILibraryItem[]) => {
        // Update the raw items stream
        this.libraryItems$.next(items);
      })
    ).subscribe();
    
    this.subscription.add(sub);
  }

  /**
   * Handle filter changes from the content filter component
   * @param filter Updated filter criteria
   */
  onFilterChange(filter: ContentFilter): void {
    this.currentFilter$.next(filter);
  }

  onViewModeChange(viewMode: ViewToggleType): void {
    if (viewMode === 'upload') {
      this.saveToggleMode = this.viewToggleMode;
    }
    if (viewMode === 'link') {
      this.saveToggleMode = this.viewToggleMode;
      this.openExternalLinkDialog();
    }
    this.viewToggleMode = viewMode;
  }

  /**
   * Open external link dialog
   */
  private openExternalLinkDialog(): void {
    this.externalLinkService.openLinkDialogWithPreview('Add External Content to Library')
      .subscribe(result => {
        if (result?.confirmed && result.url && result.remoteContent) {
          // Save the external link to the library
          const sub = this.libraryService.addExternalUrlToLibrary(
            result.url,
            result.remoteContent.type,
            result.remoteContent.title,
            result.remoteContent.size
          ).subscribe({
            next: (item: ILibraryItem) => {
              this.refreshItems();
            }
          });
          this.subscription.add(sub);
        } else {
          this.viewToggleMode = this.saveToggleMode;
        }
        // Reset view mode regardless of result
        this.viewToggleMode = this.saveToggleMode;
      });
  }

  /**
   * Handle item view
   */
  onItemView(item: ILibraryItem): void {
    this.contentViewerService.showContent(item);
  }

  /**
   * Handles the deletion of a library item
   * @param item The library item to delete
   */
  onItemDelete(item: ILibraryItem): void {
    const id = item.id || undefined;
    if (!id && !isNumber(id)) {
      return;
    }
    // Show confirmation dialog before proceeding with deletion
    this.confirmService.open({
      title: this.translocoService.translate('library.confirmDelete'),
      message: this.translocoService.translate('library.deleteMessage', { name: item.name })
    }).subscribe(confirmed => {
      if (confirmed) {
        const sub = this.libraryService.deleteLibraryItem(id).subscribe({
          next: () => {
            // Refresh the library items after successful deletion
            this.refreshItems();
          }
          // Error handling is managed in the API service
        });
        this.subscription.add(sub);
      }
    });
  }

  /**
   * Handle file selection from drop-upload component
   */
  onFileRemoved(): void {
    this.viewToggleMode = this.saveToggleMode;
  }

  /**
   * Handle file selection from drop-upload component
   */
  onFileSelected(event: FileUploadEvent): void {
    // Handle any errors
    if (event.error) {
      console.error('Upload error:', event.error);
      return;
    }
  }

  /**
   * Handle file upload from drop-upload component
   */
  onFileUpload(event: FileUploadEvent): void {
    if (!event.file) {
      console.error('Error: ', event.error);
      return;
    }

    // Get file type 
    const fileType = event.file.type || 'application/octet-stream';

    // Use the uploadToLibrary method which handles FormData properly
    this.libraryService.uploadToLibrary(event.file, fileType).subscribe({
      next: (item: ILibraryItem) => {
        this.refreshItems();
        this.viewToggleMode = this.saveToggleMode;
      }
    });
  }

  // Handle selection of items from the library
  onItemAddToCapsule(item: ILibraryItem): void {
    if (!this.currentCapsule || typeof this.currentCapsule.id !== 'number') {
      console.warn('No capsule selected, cannot add items');
      return;
    }
    
    const sub = this.itemsService.addItemFromLibrary(this.currentCapsule.id, item).subscribe({
      next: (newItem) => {
        this.snackbarService.success(
          this.translocoService.translate('library.addedToCapsule', { name: newItem.name })
        );
        this.UIRefreshService.triggerRefresh('items');
      }
    });
    this.subscription.add(sub);
  }

  refreshCapsuleItems(): void {
    this.UIRefreshService.triggerRefresh('library');
  }
}