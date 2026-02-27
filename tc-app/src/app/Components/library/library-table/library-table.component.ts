import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ILibraryItem } from '../../../Models/models.interface';
import { TranslocoModule } from '@jsverse/transloco';
import { ContentTypeHelper } from '../../../Utils/content-type.helper';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'tc-library-table',
  templateUrl: './library-table.component.html',
  styleUrls: ['./library-table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TranslocoModule
  ]
})
export class LibraryTableComponent {
  @Input() items: ILibraryItem[] = [];
  @Input() selectable = false;
  @Input() selectedItems: ILibraryItem[] = [];
  @Input() isEmbedded = false;
  
  @Output() itemSelect = new EventEmitter<ILibraryItem>();
  @Output() itemView = new EventEmitter<ILibraryItem>();
  @Output() itemDelete = new EventEmitter<ILibraryItem>();

  // Define displayed columns
  displayedColumns: string[] = ['selection', 'icon', 'name', 'meta', 'actions'];

  constructor() {
    // Initialize columns based on inputs
    this.updateDisplayColumns();
  }

  // When inputs change, update display columns
  ngOnChanges(): void {
    this.updateDisplayColumns();
  }

  /**
   * Update the displayed columns based on inputs
   */
  private updateDisplayColumns(): void {
    this.displayedColumns = [];
    
    // Only show selection column when selectable
    if (this.selectable) {
      this.displayedColumns.push('selection');
    }
    
    // Always show these columns
    this.displayedColumns.push('icon', 'name', 'meta', 'actions');
  }

  /**
   * Check if an item is selected
   */
  isItemSelected(item: ILibraryItem): boolean {
    return this.selectedItems.some(i => i.id === item.id);
  }

  /**
   * Handle item selection
   */
  onItemSelect(item: ILibraryItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.itemSelect.emit(item);
  }

  /**
   * Handle item view
   */
  onItemView(item: ILibraryItem, event: Event): void {
    event.stopPropagation();
    this.itemView.emit(item);
  }

  /**
   * Handle item delete
   */
  onItemDelete(item: ILibraryItem, event: Event): void {
    event.stopPropagation();
    this.itemDelete.emit(item);
  }

  /**
   * Get icon for item
   */
  getIcon(item: ILibraryItem): string {
    return ContentTypeHelper.getIcon(item);
  }
}
