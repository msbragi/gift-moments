import { Injectable } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { BaseProviderService } from './base-provider.service';
import { IRemoteContent, IExternalProvider } from '../../../Models/external-providers.interface';

/**
 * Google Docs-specific content provider service
 * Handles Google Docs URL validation, metadata extraction, and embedding
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleDocsProviderService extends BaseProviderService {
  
  readonly providerName = 'GoogleDocs';
  readonly supportedDomains = ['docs.google.com'];

  /**
   * Extract metadata from Google Docs URL
   * @param url - Google Docs URL
   * @returns Observable with Google Docs content metadata
   */
  extractMetadata(url: string): Observable<IRemoteContent> {
    const docId = this.extractContentId(url);
    const docType = this.extractDocumentType(url);
    const provider = this.getProviderConfig();
    
    const metadata: IRemoteContent = {
      id: this.generateContentId(url),
      url: url,
      provider: provider,
      title: docId ? `Google ${docType} (${docId.substring(0, 8)}...)` : `Google ${docType}`,
      description: `Google ${docType} content`,
      type: this.getMimeTypeForDocType(docType),
      thumbnailUrl: this.getThumbnailUrl(docId, docType),
      size: undefined, // Will be enriched by backend
      metadata: {
        docId: docId,
        docType: docType,
        embedUrl: this.getEmbedUrl(url),
        provider: 'google-docs',
        viewUrl: this.getViewUrl(url)
      },
      created: new Date(),
      updated: new Date()
    };

    return of(metadata).pipe(
      catchError(error => {
        console.error('Error extracting Google Docs metadata:', error);
        return of({
          ...metadata,
          title: `Google ${docType}`,
          description: 'Unable to extract metadata'
        });
      })
    );
  }

  /**
   * Convert to embed URL for Google Docs
   * @param url - Original Google Docs URL
   * @returns Embed URL for iframe embedding
   */
  getEmbedUrl(url: string): string {
    const docId = this.extractContentId(url);
    const docType = this.extractDocumentType(url);
    if (!docId) return url;

    const baseUrl = `https://docs.google.com/${docType}/d/${docId}`;
    return `${baseUrl}/preview`;
  }

  /**
   * Get view URL for Google Docs
   * @param url - Original Google Docs URL
   * @returns View URL for direct viewing
   */
  getViewUrl(url: string): string {
    const docId = this.extractContentId(url);
    const docType = this.extractDocumentType(url);
    if (!docId) return url;

    return `https://docs.google.com/${docType}/d/${docId}/view`;
  }

  /**
   * Verify content accessibility
   * @param url - URL to verify
   * @returns Observable boolean indicating if content is accessible
   */
  verifyAccessibility(url: string): Observable<boolean> {
    const docId = this.extractContentId(url);
    if (!docId) return of(false);

    // Basic check - more sophisticated verification can be added
    return of(true);
  }

  /**
   * Extract document ID from Google Docs URL
   * @param url - Google Docs URL
   * @returns Document ID or null if not found
   */
  protected extractContentId(url: string): string | null {
    // Patterns:
    // https://docs.google.com/document/d/{docId}/edit
    // https://docs.google.com/spreadsheets/d/{docId}/edit
    // https://docs.google.com/presentation/d/{docId}/edit
    // https://docs.google.com/forms/d/{docId}/edit
    
    const pattern = /\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(pattern);
    return match ? match[1] : null;
  }

  /**
   * Extract document type from URL
   * @param url - Google Docs URL
   * @returns Document type (document, spreadsheets, presentation, forms)
   */
  private extractDocumentType(url: string): string {
    if (url.includes('/document/')) return 'document';
    if (url.includes('/spreadsheets/')) return 'spreadsheets';
    if (url.includes('/presentation/')) return 'presentation';
    if (url.includes('/forms/')) return 'forms';
    
    // Default
    return 'document';
  }

  /**
   * Get MIME type for document type
   * @param docType - Document type
   * @returns Corresponding MIME type
   */
  private getMimeTypeForDocType(docType: string): string {
    const mimeTypes: Record<string, string> = {
      'document': 'application/vnd.google-apps.document',
      'spreadsheets': 'application/vnd.google-apps.spreadsheet',
      'presentation': 'application/vnd.google-apps.presentation',
      'forms': 'application/vnd.google-apps.form'
    };

    return mimeTypes[docType] || 'application/vnd.google-apps.document';
  }

  /**
   * Get thumbnail URL for document
   * @param docId - Document ID
   * @param docType - Document type
   * @returns Thumbnail URL or undefined
   */
  private getThumbnailUrl(docId: string | null, docType: string): string | undefined {
    if (!docId) return undefined;

    // Google Docs doesn't provide direct thumbnail URLs like Drive
    // But we can use a placeholder or try to generate one
    return undefined;
  }

  /**
   * Get provider configuration
   * @returns Provider configuration object
   */
  private getProviderConfig(): IExternalProvider {
    return {
      name: this.providerName,
      domains: this.supportedDomains,
      icon: 'description',
      supportsMetadata: true,
      embedSupport: true
    };
  }
}
