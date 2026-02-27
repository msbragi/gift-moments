import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { IItem, ILibraryItem } from '../../../Models/models.interface';
import { ContentTypeHelper } from '../../../Utils/content-type.helper';
import { ActionButtons } from '../../../Features/action-buttons/action-buttons.component';


@Directive({
  standalone: true,
})

export abstract class BaseItemsComponent<T extends IItem | ILibraryItem> {
  @Input() items: T[] = [];
  @Input() showAddToCapsule: boolean = false;
  
  @Output() itemView = new EventEmitter<T>();
  @Output() itemDelete = new EventEmitter<T>();
  @Output() itemAddToCapsule = new EventEmitter<T>();

  /**
   * Get icon based on content type
   * @param item The item to get the icon for
   * @returns Icon name for the item
   */
  getIcon(item: T): string {
    return ContentTypeHelper.getIcon(item);
  }

  /**
   * Get available actions for an item
   * @returns Array of action button types
   */
  getItemActions(): ActionButtons[] {
    const actions: ActionButtons[] = ['view', 'delete'];
    if (this.showAddToCapsule) {
      actions.unshift('capsuleAdd');
    }
    return actions;
  }

  /**
   * Handle action triggered from action buttons component
   * @param action The action type
   * @param item The item to perform action on
   */
  onItemAction(action: ActionButtons, item: T): void {
    switch (action) {
      case 'view':
        this.itemView.emit(item);
        break;
      case 'delete':
        this.itemDelete.emit(item);
        break;
      case 'capsuleAdd':
        this.onItemAddToCapsule(item);
        break;
    }
  }

  /**
   * Handle item view action (legacy method)
   * @param item The item to view
   * @param event The click event
   */
  onView(item: T, event: Event): void {
    event.stopPropagation();
    this.itemView.emit(item);
  }

  /**
   * Handle item delete action (legacy method)
   * @param item The item to delete
   * @param event The click event
   */
  onDelete(item: T, event: Event): void {
    event.stopPropagation();
    this.itemDelete.emit(item);
  }

  /**
   * Handle add to capsule action
   * @param item The item to add to capsule
   * @param event The click event
   */
  onItemAddToCapsule(item: T, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.itemAddToCapsule.emit(item);
  }
}