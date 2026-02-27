import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, filter, map, from, switchMap } from 'rxjs';
import { ExternalLinkDialogData, ExternalLinkDialogResult } from './external-link.model';

/**
 * Service for managing external link dialogs
 * Provides methods to open and configure external link input dialogs
 */
@Injectable({
  providedIn: 'root'
})
export class ExternalLinkService {

  constructor(private dialog: MatDialog) {}

  /**
   * Opens the external link dialog
   * @param data Configuration for the dialog
   * @returns Observable that emits the dialog result
   */
  openLinkDialog(data?: ExternalLinkDialogData): Observable<ExternalLinkDialogResult> {
    // Import the component dynamically to avoid circular dependency
    return from(import('./external-link-dialog.component')).pipe(
      switchMap(({ ExternalLinkDialogComponent }) => {
        const dialogRef: MatDialogRef<any, ExternalLinkDialogResult> = 
          this.dialog.open(ExternalLinkDialogComponent, {
            width: '700px',
            maxWidth: '90vw',
            disableClose: false,
            autoFocus: true,
            data: {
              title: 'Add External Link',
              placeholder: 'Enter URL (YouTube, Vimeo, etc.)',
              showPreview: true,
              ...data
            }
          });

        return dialogRef.afterClosed().pipe(
          filter(result => result !== undefined),
          map(result => result as ExternalLinkDialogResult)
        );
      })
    );
  }

  /**
   * Opens a simplified link dialog for quick URL input
   * @param title Dialog title
   * @param placeholder Input placeholder
   * @returns Observable that emits the dialog result
   */
  openQuickLinkDialog(title?: string, placeholder?: string): Observable<ExternalLinkDialogResult> {
    return this.openLinkDialog({
      title: title || 'Add Link',
      placeholder: placeholder || 'Enter URL',
      showPreview: false
    });
  }

  /**
   * Opens link dialog with preview enabled
   * @param title Dialog title
   * @returns Observable that emits the dialog result
   */
  openLinkDialogWithPreview(title?: string): Observable<ExternalLinkDialogResult> {
    return this.openLinkDialog({
      title: title || 'Add External Content',
      placeholder: 'Enter content URL',
      showPreview: true
    });
  }
}
