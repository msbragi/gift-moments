import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Observable, Subscription, of } from 'rxjs';
import { ConfirmDialogService } from '../../../../Features/confirm/confirm-dialog.service';
import { ContentViewerService } from '../../../../Features/content-viewer/content-viewer.service';
import { DropUploadComponent } from '../../../../Features/drop-upload/drop-upload.component';
import { ExternalLinkService } from '../../../../Features/external-link';
import { ICapsule, IItem } from '../../../../Models/models.interface';
import { FileUploadEvent } from '../../../../Models/upload.model';
import { ItemsService } from '../../../../Services/api/items.service';
import { ContentTypeHelper } from '../../../../Utils/content-type.helper';
import { CapsulesUIRefreshService } from '../../capsules-ui-refresh.service';
import { PanelViewToggleComponent, ViewToggleOptions, ViewToggleType } from '../shared/elements/panel-view-toggle.component';
import { CapsuleItemsCardComponent } from './capsule-items-card.component';
import { CapsuleItemsTableComponent } from './capsule-items-table.component';

@Component({
  selector: 'tc-capsule-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    TranslocoModule,
    PanelViewToggleComponent,
    DropUploadComponent,
    CapsuleItemsCardComponent,
    CapsuleItemsTableComponent
  ],
  templateUrl: './capsule-items.component.html',
  styleUrl: '../shared/templates/items-template.scss',
})
export class CapsuleItemsComponent implements OnDestroy {
  // Current capsule
  items$: Observable<IItem[]> = of([]);

  // Current capsule and recipients
  private _currentCapsule: ICapsule | null = null;
  @Input() set currentCapsule(value: ICapsule | null) {
    this._currentCapsule = value;
    this.items$ = of(value?.items ?? []);
  }
  get currentCapsule(): ICapsule | null {
    return this._currentCapsule;
  }

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
  private subscription = new Subscription();

  constructor(
    private itemsService: ItemsService,
    private capsuleUiRefresh: CapsulesUIRefreshService,
    private contentViewerService: ContentViewerService,
    private confirmService: ConfirmDialogService,
    private externalLinkService: ExternalLinkService,
    private translocoService: TranslocoService
  ) {}

  /**
   * Clean up subscriptions when component is destroyed
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
    const capsuleId = this.currentCapsule?.id;
    if (!capsuleId) {
      this.viewToggleMode = this.saveToggleMode;
      return;
    }
    this.externalLinkService.openLinkDialogWithPreview('Add External Content to capsule')
      .subscribe(result => {
        if (result?.confirmed && result.url && result.remoteContent) {
          // Save the external link to the library
          const sub = this.itemsService.addExternalUrlToLibrary(
            capsuleId,
            result.url,
            result.remoteContent.type,
            result.remoteContent.title,
            result.remoteContent.size
          ).subscribe({
            next: (item: IItem) => {
              this.capsuleUiRefresh.triggerRefresh('items');
            }
          });
          this.subscription.add(sub);
        }
        // Reset view mode regardless of result
        this.viewToggleMode = this.saveToggleMode;
      });
  }

  /**
   * Handle item view
   */
  onItemView(item: IItem): void {
    this.contentViewerService.showContent(item);
  }

  /**
   * Handle item delete
   */
  onItemDelete(item: IItem): void {
    const id = item.id;
    if (!id) {
      return;
    }

    // Show confirmation dialog before deleting
    this.confirmService.open({
      title: this.translocoService.translate('item.confirmDelete'),
      message: this.translocoService.translate('item.deleteItemMessage', { name: item.name })
    }).subscribe(confirmed => {
      if (confirmed && this.currentCapsule?.id) {
        const sub = this.itemsService.deleteItem(this.currentCapsule.id, id).subscribe({
          next: () => {
              this.capsuleUiRefresh.triggerRefresh('items');
          }
        });
        this.subscription.add(sub);
      }
    });
  }

  /**
   * Get file icon from item type
   */
  getIcon(item: IItem): string {
    return ContentTypeHelper.getIcon(item);
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
    if (!this.currentCapsule?.id || !event.file) {
      console.error('Error: Missing capsule ID or file');
      return;
    }

    // Get file type 
    const fileType = event.file.type || 'application/octet-stream';

    // Use the uploadToLibrary method which handles FormData properly
    this.itemsService.uploadItemContent(this.currentCapsule?.id, event.file, fileType).subscribe({
      next: (item) => {
        this.capsuleUiRefresh.triggerRefresh('items');
        this.viewToggleMode = this.saveToggleMode;
      }
    });
  }

}