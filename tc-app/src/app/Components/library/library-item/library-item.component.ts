import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslocoModule } from '@jsverse/transloco';
import { ILibraryItem } from '../../../Models/models.interface';
import { ContentTypeHelper } from '../../../Utils/content-type.helper';
import { DateFormatPipe } from '../../../Pipes/date-format.pipe';
@Component({
  selector: 'tc-library-item',
  templateUrl: './library-item.component.html',
  styleUrls: ['./library-item.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCheckboxModule,
    TranslocoModule,
    DateFormatPipe
  ]
})
export class LibraryItemComponent {
  @Input() item!: ILibraryItem;
  @Input() selectable = false;
  @Input() selected = false;
  @Input() compact = false;

  @Output() select = new EventEmitter<ILibraryItem>();
  @Output() view = new EventEmitter<ILibraryItem>();
  @Output() delete = new EventEmitter<ILibraryItem>();

  /**
   * Get file icon from content type
   */
  getIcon(): string {
    return ContentTypeHelper.getIcon(this.item);
  }
  
  /**
   * Handle selection toggle
   */
  onSelect(): void {
    if (this.selectable) {
      this.select.emit(this.item);
    }
  }
  
  /**
   * View item details
   */
  onView(event: Event): void {
    event.stopPropagation();
    this.view.emit(this.item);
  }
  
  /**
   * Delete the item
   */
  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.item);
  }
}
