import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslocoModule } from '@jsverse/transloco';
import { Observable, Subscription } from 'rxjs';
import { IItem, ILibraryItem } from '../../Models/models.interface';
import { ContentsService } from '../../Services/api/contents.service';

/**
 * Component for displaying various content types
 */
@Component({
  selector: 'tc-content-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslocoModule
  ],
  templateUrl: './content-viewer.component.html',
  styleUrl: './content-viewer.component.scss'
})
export class ContentViewerComponent implements OnInit, OnDestroy {
  /**
   * The media type category of the content
   */
  contentType: string;

  /**
   * The URL to the content after it's loaded
   */
  contentUrl: SafeUrl | null = null;

  /**
   * Text content for text-type content
   */
  textContent: string | null = null;

  private subscription = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<ContentViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public item: ILibraryItem | IItem,
    private contentsService: ContentsService,
    private sanitizer: DomSanitizer
  ) {
    this.contentType = this.determineContentType(item.contentType ?? '');
  }

  /**
   * Initialize the component and load content
   */
  ngOnInit(): void {
    this.loadContent();
  }

  /**
   * Cleanup subscriptions on destroy
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Closes the dialog
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * Load content from the API
   */
  private loadContent(): void {
    // Extract contentId from the item
    let content$: Observable<Blob> | null = null;

    const contentId = this.getContentIdFromItem(this.item);

    if (!contentId) {
      console.error('Content ID not found in item');
      return;
    }

    if(!this.item?.id) {
      console.error('ID not found in item');
      return;
    }

    if ('capsuleId' in this.item) {
      content$ = this.contentsService.getCapsuleItemContent(
        this.item.capsuleId,
        this.item.id,
        contentId);
    } else { 
      content$ = this.contentsService.getLibraryItemContent(contentId);
    }
    const sub = content$.subscribe({
      next: (blob: Blob) => {
        if (this.contentType === 'text') {
          // For text content, read as text
          this.handleTextContent(blob);
        } else {
          // For other content, create an object URL
          this.createObjectUrl(blob);
        }
      }
    });

    this.subscription.add(sub);
  }

  /**
   * Get the content ID from either an ILibraryItem or IItem
   */
  private getContentIdFromItem(item: ILibraryItem | IItem): number | null {
    // Check if item has contentId property
    if ('contentId' in item && typeof item.contentId === 'number') {
      return item.contentId;
    }

    // If it's an IItem, it might have different property name or be nested
    // Adjust this logic as needed based on your item interface structure

    return null;
  }

  /**
   * Create an object URL from a blob
   */
  private createObjectUrl(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    // Directly sanitize the URL here
    this.contentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Handle text content by reading the blob as text
   */
  private handleTextContent(blob: Blob): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.textContent = reader.result as string;
    };
    reader.readAsText(blob);
  }

  /**
   * Determines the general content type category
   * @param mimeType The MIME type of the content
   * @returns The general content type category
   */
  private determineContentType(mimeType: string): string {
    console.log('MIME Type:', mimeType);
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.startsWith('video/')) {
      return 'video';
    } else if (mimeType.startsWith('audio/')) {
      return 'audio';
    } else if (mimeType.startsWith('application/pdf')) {
      return 'pdf';
    } else if (mimeType.startsWith('text/')) {
      return 'text';
    } else {
      return 'other';
    }
  }
}