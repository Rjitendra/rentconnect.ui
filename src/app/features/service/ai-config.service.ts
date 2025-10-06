import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ResultStatusType } from '../../common/enums/common.enums';
import { Result } from '../../common/models/common';
import { AiChatConfig } from '../models/chatbot';

@Injectable({
  providedIn: 'root',
})
export class AiConfigService {
  private readonly http = inject(HttpClient);

  /**
   * Get active AI configuration
   */
  getActiveConfig(): Observable<AiChatConfig | null> {
    // If using local mode, return local config
    if (environment.ai.mode === 'local') {
      return of({
        provider: environment.ai.local.provider as 'openai' | 'azure',
        apiKey: environment.ai.local.apiKey,
        model: environment.ai.local.model,
        maxTokens: environment.ai.local.maxTokens,
        temperature: environment.ai.local.temperature,
        isActive: true,
      });
    }

    // Otherwise, fetch from backend
    return this.http
      .get<Result<AiChatConfig>>(`${environment.apiBaseUrl}AiConfig/active`)
      .pipe(
        map((result) => {
          if (result.status === ResultStatusType.Success && result.entity) {
            return result.entity;
          }
          return null;
        }),
        catchError(() => of(null)),
      );
  }

  /**
   * Get all AI configurations (for admin)
   */
  getAllConfigs(): Observable<AiChatConfig[]> {
    return this.http
      .get<Result<AiChatConfig[]>>(`${environment.apiBaseUrl}AiConfig/all`)
      .pipe(
        map((result) => {
          if (result.status === ResultStatusType.Success && result.entity) {
            return result.entity;
          }
          return [];
        }),
        catchError(() => of([])),
      );
  }

  /**
   * Create new AI configuration
   */
  createConfig(
    config: Partial<AiChatConfig>,
  ): Observable<Result<AiChatConfig>> {
    return this.http.post<Result<AiChatConfig>>(
      `${environment.apiBaseUrl}AiConfig/create`,
      config,
    );
  }

  /**
   * Update AI configuration
   */
  updateConfig(
    id: number,
    config: Partial<AiChatConfig>,
  ): Observable<Result<AiChatConfig>> {
    return this.http.put<Result<AiChatConfig>>(
      `${environment.apiBaseUrl}AiConfig/${id}`,
      config,
    );
  }

  /**
   * Delete AI configuration
   */
  deleteConfig(id: number): Observable<Result<boolean>> {
    return this.http.delete<Result<boolean>>(
      `${environment.apiBaseUrl}AiConfig/${id}`,
    );
  }

  /**
   * Set active AI configuration
   */
  setActiveConfig(id: number): Observable<Result<boolean>> {
    return this.http.put<Result<boolean>>(
      `${environment.apiBaseUrl}AiConfig/${id}/activate`,
      {},
    );
  }

  /**
   * Test AI configuration
   */
  testConfig(
    config: Partial<AiChatConfig>,
  ): Observable<Result<{ success: boolean; message: string }>> {
    return this.http.post<Result<{ success: boolean; message: string }>>(
      `${environment.apiBaseUrl}AiConfig/test`,
      config,
    );
  }

  /**
   * Get available models for a provider
   */
  getAvailableModels(provider: 'openai' | 'azure'): string[] {
    if (provider === 'openai') {
      return [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
      ];
    } else {
      // Azure models (custom deployment names)
      return ['gpt-4o', 'gpt-4', 'gpt-35-turbo'];
    }
  }
}
