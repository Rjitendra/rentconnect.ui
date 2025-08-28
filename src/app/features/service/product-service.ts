import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Update the path below to the correct location of your product DTO interface
import { IProductDto } from '../models/iproduct';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  private baseUrl = 'https://localhost:5000/api/product';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  getAll(): Observable<IProductDto[]> {
    return this.http.get<IProductDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<IProductDto> {
    return this.http.get<IProductDto>(`${this.baseUrl}/${id}`);
  }

  save(product: IProductDto): Observable<IProductDto> {
    return this.http.post<IProductDto>(
      'https://localhost:5000/api/product/save',
      product,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      },
    );
  }

  discardDraft(product: IProductDto): Observable<IProductDto> {
    return this.http.post<IProductDto>(
      'https://localhost:5000/api/product/discard-draft',
      product,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      },
    );
  }

  update(product: IProductDto): Observable<IProductDto> {
    return this.http.put<IProductDto>(`${this.baseUrl}/${product.id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
