import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../api/auth.service';
import { SnackbarService } from './snackbar.service';
import { StoreService } from './store.service';
/**
 * https://console.cloud.google.com/auth/overview?inv=1&invt=AbwObw&project=time-capsule-app-417310
 */
declare var google: any;
@Injectable({
    providedIn: 'root'
})
export class GoogleAuthService {
    private isInitialized = false;
    private clientId: string | null = null;
    private redirectUri: string | null = null;

    constructor(
        private snackBarService: SnackbarService,
        private authService: AuthService,
        private router: Router,
        private ngZone: NgZone
    ) {
        this.clientId = StoreService.getGoogleClientId();
        this.redirectUri = StoreService.getGoogleRedirectUri();
    }

    /**
     * Initialize Google Sign-In SDK
     */
    initialize(): Observable<boolean> {
        if (this.isInitialized) {
            return of(true);
        }
        if (typeof google === 'undefined' || !google.accounts) {
            console.error('Google API not loaded');
            return throwError(() => new Error('Google API not available'));
        }
        return from(new Promise<boolean>((resolve) => {
            try {
                google.accounts.id.initialize({
                    client_id: this.clientId,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    callback: (response: any) => {
                        this.ngZone.run(() => {
                            this.handleGoogleResponse(response);
                        })
                    }
                });
                this.isInitialized = true;
                console.log('Google Sign-In initialized successfully');
                resolve(true);
            } catch (error) {
                console.error('Failed to initialize Google Sign-In:', error);
                resolve(false);
            }
            catchError(err => {
                this.snackBarService.error('Google Sign-In unavailable');
                console.error('Google Sign-In error:', err);
                return of(false);
            });
        }));
    }
    /**
     * Show fallback Google popup for login
     */
    private showGooglePopup(): void {
        if (!this.clientId || !this.redirectUri) {
            this.snackBarService.error('Google Sign-In configuration error');
            return;
        }

        try {
            // Create a button element that we'll use to trigger the sign-in
            const buttonElement = document.createElement('div');
            buttonElement.className = 'temp-google-signin-button-container';
            buttonElement.style.display = 'none';
            document.body.appendChild(buttonElement);

            // Configure and render a Google button programmatically
            google.accounts.id.renderButton(
                buttonElement,
                {
                    theme: 'outline',
                    size: 'large',
                    type: 'standard',
                    // Add a class to make it easier to find
                    class: 'temp-google-signin-button'
                }
            );

            // Wait a short moment for button to render
            setTimeout(() => {
                // Find the button by class name
                const buttons = document.getElementsByClassName('temp-google-signin-button');
                if (buttons.length > 0) {
                    // Cast to HTMLElement for TypeScript
                    const button = buttons[0] as HTMLElement;
                    button.click();
                } else {
                    // Try alternate selector if class doesn't work
                    const backupButton = buttonElement.querySelector('div[role="button"]') as HTMLElement;
                    if (backupButton) {
                        backupButton.click();
                    } else {
                        console.error('Could not find button element to click');
                        // Fall back to prompt if button not found
                        google.accounts.id.prompt();
                    }
                }

                // Remove the temporary button element
                setTimeout(() => {
                    if (document.body.contains(buttonElement)) {
                        document.body.removeChild(buttonElement);
                    }
                }, 1000);
            }, 100); // Small delay to ensure the button renders
        } catch (error) {
            console.error('Error with Google Sign-In:', error);
            this.snackBarService.error('Failed to show Google Sign-In popup');

            // As a last resort, try to force the One Tap UI to appear
            try {
                google.accounts.id.prompt((notification: any) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        console.log('Google One Tap still not displayed:',
                            notification.getNotDisplayedReason() ||
                            notification.getSkippedReason());
                        this.snackBarService.error('Google Sign-In unavailable. Please try again later.');
                    }
                });
            } catch (err) {
                console.error('Final Google Sign-In attempt failed:', err);
            }
        }
    }

    /**
     * Trigger Google login flow
     */
    triggerLogin(): Observable<boolean> {
        return this.initialize().pipe(
            switchMap(initialized => {
                if (!initialized) {
                    return throwError(() => new Error('Failed to initialize Google Sign-In'));
                }

                return from(new Promise<boolean>((resolve) => {
                    try {
                        google.accounts.id.prompt((notification: any) => {
                            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                                console.log('Google One Tap prompt not displayed:',
                                    notification.getNotDisplayedReason() ||
                                    notification.getSkippedReason());

                                this.snackBarService.info('Using alternative Google Sign-In method');
                                this.showGooglePopup();
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        });
                    } catch (error) {
                        console.error('Error showing Google prompt:', error);
                        resolve(false);
                    }
                }));
            }),
            catchError(err => {
                this.snackBarService.error('Google Sign-In unavailable');
                console.error('Google Sign-In error:', err);
                return of(false);
            })
        );
    }


    private handleAccessToken(accessToken: string): void {
        // Send the access token to your backend for verification and user creation/login
        this.authService.googleLogin(accessToken).subscribe({
            next: () => {
                this.snackBarService.success('Google login successful!');
                window.location.href = '/';
            },
            error: (err: Error) => {
                this.snackBarService.error(err.message || 'Google login failed!');
            }
        });
    }

    /**
     * Handle Google Sign-In response
     */
    private handleGoogleResponse(response: any): void {
        console.log('Google Sign-In response received');
        if (response && response.credential) {
            // This is the ID token flow which your backend is expecting
            this.authService.googleLogin(response.credential).subscribe({
                next: () => {
                    this.snackBarService.success('Google login successful!');
                    // Navigate or perform action on successful login
                    this.router.navigate(['/dashboard']);
                },
                error: (err: Error) => {
                    this.snackBarService.error(err.message || 'Google login failed!');
                },
            });
        } else {
            console.error('Invalid Google Sign-In response');
            this.snackBarService.error('Invalid Google Sign-In response');
        }
    }
}