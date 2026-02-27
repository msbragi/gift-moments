import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { Observable, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';
import { StoreService } from '../Services/common/store.service';
import { ConfigService } from '../Services/common/config.service';

interface StaticContentState {
    isLoading: boolean;
    error: boolean;
    content: SafeHtml | null;
    pageId?: string;
}

@Component({
    selector: 'app-static-content',
    standalone: true,
    imports: [
        CommonModule,
        TranslocoDirective
    ],
    templateUrl: './static-content.component.html',
    styleUrls: ['./static-content.component.scss']
})
export class StaticContentComponent implements OnInit {
    state$: Observable<StaticContentState> | undefined;
    translationHint = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private sanitizer: DomSanitizer,
        private translocoService: TranslocoService
    ) { }

    ngOnInit(): void {
        // Get pageId from either route data or route params
        const pageId$ = combineLatest([
            this.route.data.pipe(map(data => data['pageId'])),
            this.route.params.pipe(map(params => params['pageId']))
        ]).pipe(
            map(([dataPageId, paramPageId]) => dataPageId || paramPageId),
            distinctUntilChanged()
        );

        const source$ = combineLatest([
            pageId$,
            this.translocoService.langChanges$.pipe(startWith(this.translocoService.getActiveLang()))
        ]).pipe(
            map(([pageId, lang]) => ({ pageId, lang })),
            distinctUntilChanged((prev, curr) => prev.pageId === curr.pageId && prev.lang === curr.lang),
            tap(params => console.log(`Loading content for: ${JSON.stringify(params)}`))
        );

        this.state$ = source$.pipe(
            switchMap(({ pageId, lang }) => {
                if (!pageId || !lang) {
                    return of<StaticContentState>({
                        isLoading: false,
                        error: true,
                        content: this.createErrorHtml('Configuration error.')
                    });
                }

                return this.loadContent(pageId, lang).pipe(
                    startWith({ isLoading: true, error: false, content: null })
                );
            })
        );
    }

    /**
     * Load content with simple fallback strategy
     */
    private loadContent(pageId: string, requestedLang: string): Observable<StaticContentState> {
        return new Observable<StaticContentState>(observer => {
            this.loadContentAsync(pageId, requestedLang)
                .then(state => {
                    observer.next(state);
                    observer.complete();
                })
                .catch(error => {
                    console.error('Error loading content:', error);
                    observer.next({
                        isLoading: false,
                        error: true,
                        content: this.createErrorHtml('Failed to load content.'),
                        pageId: pageId
                    });
                    observer.complete();
                });
        });
    }

    /**
     * Simple async content loading with index.html detection
     */
    private async loadContentAsync(pageId: string, requestedLang: string): Promise<StaticContentState> {
        console.log(`Loading content for pageId: ${pageId}, lang: ${requestedLang}`);

        // Step 1: Check if English version exists (mandatory)
        const englishContent = await this.fetchContent(pageId, 'en');
        if (!englishContent) {
            // English doesn't exist, redirect to under-construction
            if (pageId !== 'under-construction') {
                this.router.navigate(['/pages', 'under-construction']);
                return {
                    isLoading: false,
                    error: false,
                    content: this.sanitizer.bypassSecurityTrustHtml('<p>Redirecting...</p>'),
                    pageId: 'under-construction'
                };
            } else {
                // under-construction itself is missing
                return {
                    isLoading: false,
                    error: true,
                    content: this.createErrorHtml('Page not available.'),
                    pageId: pageId
                };
            }
        }

        // Step 2: Try requested language (if not English)
        if (requestedLang !== 'en') {
            const requestedContent = await this.fetchContent(pageId, requestedLang);
            if (requestedContent) {
                console.log(`Using ${requestedLang} content for ${pageId}`);
                return {
                    isLoading: false,
                    error: false,
                    content: this.sanitizer.bypassSecurityTrustHtml(requestedContent),
                    pageId: pageId
                };
            }
            console.log(`${requestedLang} not available, using English fallback`);
        }

        // Step 3: Use English as fallback
        console.log(`Using English content for ${pageId}`);
        return {
            isLoading: false,
            error: false,
            content: this.sanitizer.bypassSecurityTrustHtml(englishContent),
            pageId: pageId
        };
    }

    /**
     * Fetch content and detect if it's real content or index.html fallback
     */
    private async fetchContent(pageId: string, lang: string): Promise<string | null> {
        try {
            const version = StoreService.getAppVersion();
            const url = `assets/i18n/pages/${pageId}/${lang}.html?v=${version}`;
            const response = await fetch(url);
            const content = await response.text();
            this.translationHint = content.includes('<app-root></app-root>');
            // Check if we got index.html fallback instead of real content
            if (this.translationHint) {
                console.log(`File not found: ${url} (got index.html fallback)`);
                return null;
            }

            console.log(`File found: ${url} (${content.length} chars)`);
            return content;
        } catch (error) {
            console.log(`Fetch error for ${pageId}/${lang}:`, error);
            return null;
        }
    }

    private createErrorHtml(message: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(`<p>${message}</p>`);
    }

    /**
     * Handle content clicks for interactive elements
     */
    contentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (target && target.classList.contains('cta-button')) {
            if (StoreService.get('auth_token')) {
                this.router.navigate(['/capsules']);
            } else {
                this.router.navigate(['/login']);
            }
        }
    }
}