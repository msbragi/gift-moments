import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { IExternalProvider, IRemoteContent } from '../../../Models/external-providers.interface';
import { StoreService } from '../store.service';
import { BaseProviderService } from './base-provider.service';
import { YouTubeProviderService } from './youtube-provider.service';
import { VimeoProviderService } from './vimeo-provider.service';
import { GoogleDriveProviderService } from './google-drive-provider.service';
import { GoogleDocsProviderService } from './google-docs-provider.service';

/**
 * Main orchestrator service for external content providers
 * Delegates operations to specific provider services based on URL
 */
@Injectable({
  providedIn: 'root'
})
export class ExternalProviderService {

  private providers: BaseProviderService[];

  constructor(
    private youtubeProvider: YouTubeProviderService,
    private vimeoProvider: VimeoProviderService,
    private googleDriveProvider: GoogleDriveProviderService,
    private googleDocsProvider: GoogleDocsProviderService
  ) {
    // Register all available provider services
    this.providers = [
      this.youtubeProvider,
      this.vimeoProvider,
      this.googleDriveProvider,
      this.googleDocsProvider
    ];
  }

  /**
   * Get all configured external providers from config
   * @returns Array of configured external providers
   */
  getAvailableProviders(): IExternalProvider[] {
    return StoreService.getExternalProviders();
  }

  /**
   * Validate if URL is from a supported provider
   * @param url - URL to validate
   * @returns Provider configuration if valid, null if not supported
   */
  validateProviderUrl(url: string): IExternalProvider | null {
    if (!url) {
      return null;
    }

    const providerService = this.findProviderForUrl(url);
    if (!providerService) {
      return null;
    }

    // Return config info for this provider
    const configProviders = this.getAvailableProviders();
    return configProviders.find(p => p.name === providerService.providerName) || null;
  }

  /**
   * Extract metadata from external URL
   * @param url - URL to process
   * @returns Observable with remote content metadata
   */
  extractMetadata(url: string): Observable<IRemoteContent> {
    const provider = this.findProviderForUrl(url);
    
    if (!provider) {
      return throwError(() => new Error(`Unsupported provider for URL: ${url}`));
    }

    return provider.extractMetadata(url);
  }

  /**
   * Verify if external content is accessible
   * @param url - URL to verify
   * @returns Observable boolean indicating accessibility
   */
  verifyContentAccessibility(url: string): Observable<boolean> {
    const provider = this.findProviderForUrl(url);
    
    if (!provider) {
      return throwError(() => new Error(`Unsupported provider for URL: ${url}`));
    }

    return provider.verifyAccessibility(url);
  }

  /**
   * Generate embed URL for supported providers
   * @param url - Original URL
   * @returns Embed URL if supported, original URL otherwise
   */
  getEmbedUrl(url: string): string {
    const provider = this.findProviderForUrl(url);
    return provider ? provider.getEmbedUrl(url) : url;
  }

  /**
   * Check if provider supports embedding
   * @param url - URL to check
   * @returns true if embedding is supported
   */
  supportsEmbed(url: string): boolean {
    const configProvider = this.validateProviderUrl(url);
    return configProvider?.embedSupport || false;
  }

  /**
   * Check if provider supports metadata extraction
   * @param url - URL to check
   * @returns true if metadata extraction is supported
   */
  supportsMetadata(url: string): boolean {
    const configProvider = this.validateProviderUrl(url);
    return configProvider?.supportsMetadata || false;
  }

  /**
   * Get list of all supported domains
   * @returns Array of supported domain names
   */
  getSupportedDomains(): string[] {
    const domains = new Set<string>();
    
    this.providers.forEach(provider => {
      provider.supportedDomains.forEach(domain => domains.add(domain));
    });
    
    return Array.from(domains);
  }

  /**
   * Get provider name for a given URL
   * @param url - URL to check
   * @returns Provider name or null if not supported
   */
  getProviderName(url: string): string | null {
    const provider = this.findProviderForUrl(url);
    return provider ? provider.providerName : null;
  }

  /**
   * Check if URL is from any supported provider
   * @param url - URL to check
   * @returns true if URL is supported
   */
  isUrlSupported(url: string): boolean {
    return !!this.findProviderForUrl(url);
  }

  /**
   * Find the appropriate provider service for a URL
   * @param url - URL to find provider for
   * @returns Provider service or null if not found
   */
  private findProviderForUrl(url: string): BaseProviderService | null {
    if (!url) {
      return null;
    }

    return this.providers.find(provider => provider.isUrlSupported(url)) || null;
  }
}
