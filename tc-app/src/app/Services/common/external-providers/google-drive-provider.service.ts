import { Injectable } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { BaseProviderService } from './base-provider.service';
import { IRemoteContent, IExternalProvider } from '../../../Models/external-providers.interface';

/**
 * Google Drive-specific content provider service
 * Handles Google Drive URL validation, metadata extraction, and embedding
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleDriveProviderService extends BaseProviderService {
  
  readonly providerName = 'GoogleDrive';
  readonly supportedDomains = ['drive.google.com'];

  /**
   * Extract metadata from Google Drive URL
   * @param url - Google Drive URL
   * @returns Observable with Google Drive content metadata
   */
  extractMetadata(url: string): Observable<IRemoteContent> {
    const fileId = this.extractContentId(url);
    const provider = this.getProviderConfig();
    
    const metadata: IRemoteContent = {
      id: this.generateContentId(url),
      url: url,
      provider: provider,
      title: fileId ? `Google Drive File (${fileId.substring(0, 8)}...)` : 'Google Drive Content',
      description: 'Google Drive file content',
      type: this.extractMimeTypeFromUrl(url),
      thumbnailUrl: fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w200` : undefined,
      size: undefined, // Will be enriched by backend
      metadata: {
        fileId: fileId,
        embedUrl: this.getEmbedUrl(url),
        provider: 'google-drive',
        viewUrl: this.getViewUrl(url)
      },
      created: new Date(),
      updated: new Date()
    };

    return of(metadata).pipe(
      catchError(error => {
        console.error('Error extracting Google Drive metadata:', error);
        return of({
          ...metadata,
          title: 'Google Drive Content',
          description: 'Unable to extract metadata'
        });
      })
    );
  }

  /**
   * Convert to embed URL for Google Drive
   * @param url - Original Google Drive URL
   * @returns Embed URL for iframe embedding
   */
  getEmbedUrl(url: string): string {
    const fileId = this.extractContentId(url);
    if (!fileId) return url;

    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  /**
   * Get view URL for Google Drive
   * @param url - Original Google Drive URL  
   * @returns View URL for direct viewing
   */
  getViewUrl(url: string): string {
    const fileId = this.extractContentId(url);
    if (!fileId) return url;

    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  /**
   * Verify content accessibility
   * @param url - URL to verify
   * @returns Observable boolean indicating if content is accessible
   */
  verifyAccessibility(url: string): Observable<boolean> {
    const fileId = this.extractContentId(url);
    if (!fileId) return of(false);

    // Basic check - more sophisticated verification can be added
    return of(true);
  }

  /**
   * Extract file ID from Google Drive URL
   * @param url - Google Drive URL
   * @returns File ID or null if not found
   */
  protected extractContentId(url: string): string | null {
    // Patterns:
    // https://drive.google.com/file/d/{fileId}/view
    // https://drive.google.com/file/d/{fileId}/edit
    // https://drive.google.com/open?id={fileId}
    
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9-_]+)/,
      /[?&]id=([a-zA-Z0-9-_]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Extract MIME type from URL context (basic detection)
   * @param url - Google Drive URL
   * @returns Detected MIME type or default
   */
  private extractMimeTypeFromUrl(url: string): string {
    // Basic detection based on URL patterns
    // More sophisticated detection will be done by backend
    if (url.includes('/spreadsheets/')) return 'application/vnd.google-apps.spreadsheet';
    if (url.includes('/document/')) return 'application/vnd.google-apps.document';
    if (url.includes('/presentation/')) return 'application/vnd.google-apps.presentation';
    
    // Default for drive files
    return 'application/octet-stream';
  }

  /**
   * Get provider configuration
   * @returns Provider configuration object
   */
  private getProviderConfig(): IExternalProvider {
    return {
      name: this.providerName,
      domains: this.supportedDomains,
      icon: 'cloud_upload',
      supportsMetadata: true,
      embedSupport: true
    };
  }
}
