import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Result } from '../../common/models/common';
import { ILandlord } from '../models/landlord';

@Injectable({
  providedIn: 'root',
})
export class LandlordService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}landlord`;

  getLandlord(userId: number): Observable<Result<ILandlord>> {
    return this.http.get<Result<ILandlord>>(`${this.baseUrl}/${userId}`);
  }
}
