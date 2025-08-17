import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private baseUrl = ''; // Change if needed

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  get<TResponse>(
    url: string,
    params?: Record<string, string | number>,
    fallback?: TResponse,
  ): Observable<TResponse> {
    const httpParams = new HttpParams({ fromObject: params || {} });
    return this.http
      .get<TResponse>(this.baseUrl + url, { params: httpParams })
      .pipe(catchError(this.handleError<TResponse>('GET ' + url, fallback)));
  }

  post<TRequest, TResponse>(
    url: string,
    body: TRequest,
    fallback?: TResponse,
  ): Observable<TResponse> {
    return this.http
      .post<TResponse>(this.baseUrl + url, body, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError<TResponse>('POST ' + url, fallback)));
  }

  put<TRequest, TResponse>(
    url: string,
    body: TRequest,
    fallback?: TResponse,
  ): Observable<TResponse> {
    return this.http
      .put<TResponse>(this.baseUrl + url, body)
      .pipe(catchError(this.handleError<TResponse>('PUT ' + url, fallback)));
  }

  patch<TRequest, TResponse>(
    url: string,
    body: TRequest,
    fallback?: TResponse,
  ): Observable<TResponse> {
    return this.http
      .patch<TResponse>(this.baseUrl + url, body)
      .pipe(catchError(this.handleError<TResponse>('PATCH ' + url, fallback)));
  }

  delete<TResponse>(
    url: string,
    params?: Record<string, string | number>,
    fallback?: TResponse,
  ): Observable<TResponse> {
    const httpParams = new HttpParams({ fromObject: params || {} });
    return this.http
      .delete<TResponse>(this.baseUrl + url, { params: httpParams })
      .pipe(catchError(this.handleError<TResponse>('DELETE ' + url, fallback)));
  }

  private handleError<T>(operation = 'operation', fallback?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`❌ ${operation} failed:`, error.message);
      this.alertService.error({
        errors: [{ message: `Error during ${operation}: ${error.message}`, errorType: 'error' }],
        timeout: 5000,
      });
      // You can add logging to external service here
      return fallback !== undefined ? of(fallback) : throwError(() => error);
    };
  }
}
