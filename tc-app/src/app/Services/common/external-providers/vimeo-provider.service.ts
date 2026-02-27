import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseProviderService } from './base-provider.service';
import { IRemoteContent, IExternalProvider } from '../../../Models/external-providers.interface';
import { StoreService } from '../store.service';

/**
 * Vimeo-specific content provider service
 * Handles Vimeo URL validation, metadata extraction, and embedding
 */
@Injectable({
  providedIn: 'root'
})
export class VimeoProviderService extends BaseProviderService {
  
  readonly providerName = 'Vimeo';
  readonly supportedDomains = ['vimeo.com'];

  /**
   * Extract metadata from Vimeo URL
   * @param url - Vimeo URL
   * @returns Observable with Vimeo content metadata
   */
  extractMetadata(url: string): Observable<IRemoteContent> {
    const videoId = this.extractContentId(url);
    const provider = this.getProviderConfig();
    
    const metadata: IRemoteContent = {
      id: this.generateContentId(url),
      url: url,
      provider: provider,
      title: videoId ? `Vimeo Video (${videoId})` : 'Vimeo Content',
      description: 'Vimeo video content',
      type: 'video/mp4',
      thumbnailUrl: videoId ? this.getVimeoThumbnail(videoId) : undefined,
      size: undefined, // Vimeo videos don't have fixed sizes
      metadata: {
        videoId: videoId,
        embedUrl: this.getEmbedUrl(url),
        provider: 'vimeo',
        aspectRatio: '16:9'
      },
      created: new Date(),
      updated: new Date()
    };

    return of(metadata);
  }

  /**
   * Convert Vimeo URL to embed format
   * @param url - Original Vimeo URL
   * @returns Vimeo embed URL
   */
  getEmbedUrl(url: string): string {
    const videoId = this.extractContentId(url);
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  }

  /**
   * Verify Vimeo video accessibility
   * @param url - Vimeo URL to verify
   * @returns Observable boolean (currently basic validation)
   */
  verifyAccessibility(url: string): Observable<boolean> {
    // For now, just check if we can extract video ID
    // In future, could implement actual Vimeo API check
    const videoId = this.extractContentId(url);
    return of(!!videoId);
  }

  /**
   * Extract Vimeo video ID from URL
   * @param url - Vimeo URL
   * @returns Video ID or null if not found
   */
  protected extractContentId(url: string): string | null {
    const patterns = [
      /vimeo\.com\/(?:.*\/)?(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Get provider configuration from app config
   * @returns Provider configuration
   */
  private getProviderConfig(): IExternalProvider {
    const providers = StoreService.getExternalProviders();
    return providers.find(p => p.name === this.providerName) || {
      name: this.providerName,
      domains: this.supportedDomains,
      icon: 'movie',
      supportsMetadata: true,
      embedSupport: true
    };
  }

  /**
   * Generate Vimeo thumbnail URL
   * @param videoId - Vimeo video ID
   * @returns Thumbnail URL
   */
  private getVimeoThumbnail(videoId: string): string {
    // Vimeo thumbnail pattern - this is a basic approach
    // For better quality, we would need to use Vimeo API
    return `https://vumbnail.com/${videoId}.jpg`;
  }
}
