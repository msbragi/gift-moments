import { TestBed } from '@angular/core/testing';
import { ExternalProviderService } from './external-provider.service';
import { YouTubeProviderService } from './youtube-provider.service';
import { VimeoProviderService } from './vimeo-provider.service';

describe('ExternalProviderService', () => {
  let service: ExternalProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExternalProviderService,
        YouTubeProviderService,
        VimeoProviderService
      ]
    });
    service = TestBed.inject(ExternalProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should identify YouTube URLs', () => {
    const youtubeUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://youtube.com/embed/dQw4w9WgXcQ'
    ];

    youtubeUrls.forEach(url => {
      expect(service.isUrlSupported(url)).toBe(true);
      expect(service.getProviderName(url)).toBe('YouTube');
    });
  });

  it('should identify Vimeo URLs', () => {
    const vimeoUrls = [
      'https://vimeo.com/123456789',
      'https://player.vimeo.com/video/123456789'
    ];

    vimeoUrls.forEach(url => {
      expect(service.isUrlSupported(url)).toBe(true);
      expect(service.getProviderName(url)).toBe('Vimeo');
    });
  });

  it('should reject unsupported URLs', () => {
    const unsupportedUrls = [
      'https://example.com/video',
      'https://dailymotion.com/video/123',
      'invalid-url'
    ];

    unsupportedUrls.forEach(url => {
      expect(service.isUrlSupported(url)).toBe(false);
      expect(service.getProviderName(url)).toBe(null);
    });
  });

  it('should generate embed URLs', () => {
    const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const vimeoUrl = 'https://vimeo.com/123456789';

    expect(service.getEmbedUrl(youtubeUrl)).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(service.getEmbedUrl(vimeoUrl)).toBe('https://player.vimeo.com/video/123456789');
  });
});
