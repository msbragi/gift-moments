import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseProviderService } from './base-provider.service';
import { IRemoteContent, IExternalProvider } from '../../../Models/external-providers.interface';
import { StoreService } from '../store.service';

/**
 * YouTube-specific content provider service
 * Handles YouTube URL validation, metadata extraction, and embedding
 */
@Injectable({
  providedIn: 'root'
})
export class YouTubeProviderService extends BaseProviderService {
  
  readonly providerName = 'YouTube';
  readonly supportedDomains = ['youtube.com', 'youtu.be'];

  /**
   * Extract metadata from YouTube URL
   * @param url - YouTube URL
   * @returns Observable with YouTube content metadata
   */
  extractMetadata(url: string): Observable<IRemoteContent> {
    const videoId = this.extractContentId(url);
    const provider = this.getProviderConfig();
    
    const metadata: IRemoteContent = {
      id: this.generateContentId(url),
      url: url,
      provider: provider,
      title: videoId ? `YouTube Video (${videoId})` : 'YouTube Content',
      description: 'YouTube video content',
      type: 'video/mp4',
      thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : undefined,
      size: undefined, // YouTube videos don't have fixed sizes
      metadata: {
        videoId: videoId,
        embedUrl: this.getEmbedUrl(url),
        provider: 'youtube'
      },
      created: new Date(),
      updated: new Date()
    };

    return of(metadata);
  }

  /**
   * Convert YouTube URL to embed format
   * @param url - Original YouTube URL
   * @returns YouTube embed URL
   */
  getEmbedUrl(url: string): string {
    const videoId = this.extractContentId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  /**
   * Verify YouTube video accessibility
   * @param url - YouTube URL to verify
   * @returns Observable boolean (currently basic validation)
   */
  verifyAccessibility(url: string): Observable<boolean> {
    // For now, just check if we can extract video ID
    // In future, could implement actual YouTube API check
    const videoId = this.extractContentId(url);
    return of(!!videoId);
  }

  /**
   * Extract YouTube video ID from URL
   * @param url - YouTube URL
   * @returns Video ID or null if not found
   */
  protected extractContentId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
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
      icon: 'play_circle',
      supportsMetadata: true,
      embedSupport: true
    };
  }
}
