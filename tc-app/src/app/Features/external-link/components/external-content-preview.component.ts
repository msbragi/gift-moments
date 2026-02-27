import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslocoModule } from '@jsverse/transloco';
import { IExternalProvider, IRemoteContent } from '../../../Models/external-providers.interface';
import { SnackbarService } from '../../../Services/common/snackbar.service';

/**
 * Component for displaying external content preview
 * Handles video embedding and thumbnails display
 */
@Component({
    selector: 'tc-external-content-preview',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        TranslocoModule
    ],
    template: `
    <div class="external-content-container" *transloco="let t; read: 'external-link'">
       <!-- URL Display -->
       <mat-form-field appearance="outline" class="url-field">
         <mat-label>{{ t('url-label') }}</mat-label>
         <input matInput [value]="url" disabled>
         <div matSuffix class="url-actions">
           <button mat-icon-button 
                   [matTooltip]="t('open-link')"
                   (click)="openUrl()"
                   type="button">
             <mat-icon>open_in_new</mat-icon>
           </button>
           <button mat-icon-button 
                   [matTooltip]="t('copy-link')"
                   (click)="copyUrl()"
                   type="button">
             <mat-icon>content_copy</mat-icon>
           </button>
         </div>
       </mat-form-field>

      <mat-card class="content-preview">
        <mat-card-header>
          <mat-card-title>{{ remoteContent.title }}</mat-card-title>
          <mat-card-subtitle *ngIf="remoteContent.description">
            {{ remoteContent.description }}
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>

          <!-- Video preview with embedded player -->
          <div class="preview-video" *ngIf="isVideo() && remoteContent.metadata?.['embedUrl'] && provider?.embedSupport">
            <div class="video-container">
              <iframe 
                [src]="getSecureEmbedUrl()"
                [title]="remoteContent.title"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                class="video-player">
              </iframe>
            </div>
          </div>

          <!-- Fallback for non-video content -->
          <div class="preview-thumbnail" *ngIf="!isVideo() && remoteContent.thumbnailUrl">
            <img [src]="remoteContent.thumbnailUrl" [alt]="remoteContent.title" />
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .external-content-container {
      padding: 10px;
    }
    .url-field {
      width: 100%;
      margin-bottom: 16px;
      label, input {
          color: var(--mat-sys-on-background) !important;
      }
      
      .url-actions {
        display: flex;
        gap: 4px;
      }
    }
    
    .content-preview {
      .preview-video {
        margin-top: 12px;
        
        .video-container {
          position: relative;
          height: 290px;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .video-player {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 8px;
        }
      }
      
      .preview-thumbnail {
        text-align: center;
        margin-top: 12px;
        
        img {
          max-width: 100%;
          max-height: 200px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }
  `]
})
export class ExternalContentPreviewComponent {
    @Input() remoteContent!: IRemoteContent;
    @Input() provider!: IExternalProvider;
    @Input() url!: string;

    constructor(
        private sanitizer: DomSanitizer,
        private snackBar: SnackbarService
    ) { }

    /**
     * Check if content is video type
     */
    isVideo(): boolean {
        if (this.remoteContent && this.remoteContent.type) {
            return this.remoteContent.type.startsWith('video') || false;
        }
        return false;
    }

    /**
     * Get sanitized embed URL for iframe
     */
    getSecureEmbedUrl(): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.remoteContent.metadata?.['embedUrl'] || '');
    }

    /**
     * Open URL in a new tab
     */
    openUrl(): void {
        window.open(this.url, '_blank');
    }

    /**
     * Copy URL to clipboard
     */
    async copyUrl(): Promise<void> {
        try {
            await navigator.clipboard.writeText(this.url);
            this.snackBar.success('Link copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy URL:', error);
            this.snackBar.error('Failed to copy link');
        }
    }
}
