import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IItem, ILibraryItem } from '../../Models/models.interface';
import { ContentViewerComponent } from './content-viewer.component';
import { ExternalLinkDialogComponent } from '../external-link/external-link-dialog.component';
import { ExternalLinkDialogData } from '../external-link/external-link.model';
import { IRemoteContent, IExternalProvider } from '../../Models/external-providers.interface';
import { StoreService } from '../../Services/common/store.service';

/**
 * Service for managing content preview and viewing
 */
@Injectable({
  providedIn: 'root'
})
export class ContentViewerService {
  constructor(private dialog: MatDialog) {}
  
  /**
   * Shows content in a dialog
   * @param item The content item to display
   */
  showContent(item: ILibraryItem | IItem): void {
    if (item.contentId) {
      // Show local content using original viewer
      this.showLocalContent(item);
    } else {
      this.showExternalContent(item);
    }
  }

  /**
   * Show external content using external-link dialog in readonly mode
   */
  private showExternalContent(item: ILibraryItem | IItem): void {
    const remoteContent = this.createRemoteContentFromItem(item);
    
    const dialogData: ExternalLinkDialogData = {
      title: 'View External Content',
      initialUrl: item.url!,
      showPreview: true,
      readonly: true,
      remoteContent: remoteContent
    };

    this.dialog.open(ExternalLinkDialogComponent, {
      data: dialogData,
      width: '60%',
      height: '80%',
      maxWidth: '100vw',
      maxHeight: '100vh'
    });
  }

  /**
   * Show local content using original content viewer
   */
  private showLocalContent(item: ILibraryItem | IItem): void {
    this.dialog.open(ContentViewerComponent, {
      data: item,
      width: '60%',
      height: '60%',
      maxWidth: '100vw',
      maxHeight: '100vh'
    });
  }

  /**
   * Create IRemoteContent from LibraryItem/IItem for external content
   */
  private createRemoteContentFromItem(item: ILibraryItem | IItem): IRemoteContent {
    const provider = this.getProviderFromUrl(item.url!);
    const videoId = this.extractVideoId(item.url!, provider.name);
    
    return {
      id: `external-${item.id}`,
      title: item.name || 'External Content',
      description: `${provider.name} content`,
      url: item.url!,
      type: item.contentType || 'video/mp4',
      thumbnailUrl: this.getThumbnailUrl(item.url!, provider.name, videoId),
      size: ('size' in item && item.size !== null) ? item.size : undefined,
      provider: provider,
      metadata: {
        videoId: videoId,
        embedUrl: this.getEmbedUrl(item.url!, provider.name, videoId),
        provider: provider.name.toLowerCase()
      },
      created: item.created || new Date(),
      updated: item.updated || new Date()
    };
  }

  /**
   * Get provider information from URL
   */
  private getProviderFromUrl(url: string): IExternalProvider {
    const providers = StoreService.getExternalProviders();
    
    for (const provider of providers) {
      for (const domain of provider.domains) {
        if (url.includes(domain)) {
          return provider;
        }
      }
    }
    
    // Default provider if none found
    return {
      name: 'External',
      domains: [],
      icon: 'link',
      supportsMetadata: false,
      embedSupport: false
    };
  }

  /**
   * Extract video ID from URL based on provider
   */
  private extractVideoId(url: string, providerName: string): string | null {
    if (providerName === 'YouTube') {
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
    } else if (providerName === 'Vimeo') {
      const patterns = [
        /vimeo\.com\/(?:video\/)?(\d+)/,
        /player\.vimeo\.com\/video\/(\d+)/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    
    return null;
  }

  /**
   * Get thumbnail URL based on provider
   */
  private getThumbnailUrl(url: string, providerName: string, videoId: string | null): string | undefined {
    if (providerName === 'YouTube' && videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } else if (providerName === 'Vimeo' && videoId) {
      return `https://vumbnail.com/${videoId}.jpg`;
    }
    
    return undefined;
  }

  /**
   * Get embed URL based on provider
   */
  private getEmbedUrl(url: string, providerName: string, videoId: string | null): string {
    if (providerName === 'YouTube' && videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (providerName === 'Vimeo' && videoId) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url; // Fallback to original URL
  }
}