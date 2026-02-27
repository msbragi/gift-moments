import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { LoadingService } from '../../Core/services/loading.service';

/**
 * Interceptor to manage loading state for HTTP requests
 * Tracks loading state and handles error conditions
 */
export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  const loadingService = inject(LoadingService);

  loadingService.startLoading();
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Make sure to unlock UI when errors occur
      loadingService.resetLoading();
      return throwError(() => error);
    }),
    finalize(() => {
    // This will be called on both success and error
      loadingService.stopLoading();
    })
  );
};