import { Observable } from 'rxjs';
import { IRemoteContent } from '../../../Models/external-providers.interface';

/**
 * Abstract base class for external content providers
 * Provides common functionality and enforces provider interface
 */
export abstract class BaseProviderService {
  
  abstract readonly providerName: string;
  abstract readonly supportedDomains: string[];
  
  /**
   * Check if URL belongs to this provider
   * @param url - URL to check
   * @returns true if URL is supported by this provider
   */
  isUrlSupported(url: string): boolean {
    if (!this.isValidUrl(url)) {
      return false;
    }
    
    const urlLower = url.toLowerCase();
    return this.supportedDomains.some(domain => 
      urlLower.includes(domain.toLowerCase())
    );
  }

  /**
   * Extract metadata from URL
   * @param url - URL to process
   * @returns Observable with remote content metadata
   */
  abstract extractMetadata(url: string): Observable<IRemoteContent>;

  /**
   * Convert to embed URL if supported
   * @param url - Original URL
   * @returns Embed URL or original URL if embedding not supported
   */
  abstract getEmbedUrl(url: string): string;

  /**
   * Verify content accessibility
   * @param url - URL to verify
   * @returns Observable boolean indicating if content is accessible
   */
  abstract verifyAccessibility(url: string): Observable<boolean>;

  /**
   * Extract content ID from URL (provider-specific)
   * @param url - URL to extract ID from
   * @returns Content ID or null if not found
   */
  protected abstract extractContentId(url: string): string | null;

  /**
   * Validate URL format
   * @param url - URL to validate
   * @returns true if URL is valid
   */
  protected isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Generate unique ID for remote content
   * @param url - Original URL
   * @returns Unique identifier
   */
  protected generateContentId(url: string): string {
    const contentId = this.extractContentId(url);
    return contentId ? `${this.providerName.toLowerCase()}_${contentId}` : 
           `${this.providerName.toLowerCase()}_${Date.now()}`;
  }
}
