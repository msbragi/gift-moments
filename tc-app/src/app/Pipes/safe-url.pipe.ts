import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Pipe for safely handling resource URLs in templates
 */
@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Transform a URL into a safe resource URL
   * @param url The URL to transform
   * @returns A safe resource URL that can be used in iframes, etc.
   */
  transform(url: string | SafeResourceUrl | null): SafeResourceUrl {
    if (!url) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    
    if (typeof url === 'string') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    
    // If it's already a SafeUrl, convert it to a SafeResourceUrl
    return this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
  }
}