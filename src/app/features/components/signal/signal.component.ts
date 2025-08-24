
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';


import { environment } from '../../../../environments/environment';
import { IProductDto, OperationType } from '../../models/iproduct';
import { ProductService } from '../../service/product-service';
import { CommonService } from '../../../../../projects/shared/src/public-api';

@Component({
  selector: 'ng-signal',
  imports: [
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule
],
  templateUrl: './signal.component.html',
  styleUrl: './signal.component.scss',
})
export class SignalComponent {
  readonly products = signal<IProductDto[]>([]);
  readonly model = signal<IProductDto>(this.getEmptyProduct());

  readonly validProducts = computed(() => this.products().filter((x) => !x.isDeleted));

  readonly baseUrl = environment.apiBaseUrl;

  private productService = inject(ProductService);
  private http = inject(CommonService);

  constructor() {
    effect(() => {
      console.log(`💬 Model changed: ${JSON.stringify(this.model())}`);
      console.log(`💬 Valid Products: ${JSON.stringify(this.validProducts())}`);
    });
    this.http.setBaseUrl(this.baseUrl);
    this.loadProducts();
  }

  save(): void {
    const current = this.model();
    const operationType = current.id === 0 ? OperationType.Create : OperationType.Update;

    this.productService.save({ ...current, operationType, isValid: true }).subscribe((res) => {
      this.upsertProduct(res);
      this.model.set(this.getEmptyProduct());
    });
  }

  saveAsDraft(): void {
    const current = this.model();
    const operationType = current.id === 0 ? OperationType.Create : OperationType.Update;

    this.productService.save({ ...current, operationType, isValid: false }).subscribe((res) => {
      this.upsertProduct(res);
      this.model.set(this.getEmptyProduct());
    });
  }

  edit(product: IProductDto): void {
    this.model.set({ ...product });
  }

  delete(product: IProductDto): void {
    this.productService
      .save({ ...product, operationType: OperationType.Delete })
      .subscribe((res) => {
        this.products.update((list) => list.filter((p) => p.pkId !== res.pkId));
      });
  }

  discardDraft(product: IProductDto): void {
    const url = 'product/discard-draft';
    this.http.post<IProductDto, IProductDto>(url, product).subscribe((res) => {
      if (!res) {
        this.products.update((list) => list.filter((p) => p.pkId !== product.pkId));
      } else {
        this.upsertProduct(res);
      }
      this.model.set(this.getEmptyProduct());
    });
  }

  private upsertProduct(updated: IProductDto): void {
    this.products.update((list) => {
      const index = list.findIndex((p) => p.pkId === updated.pkId);
      if (index !== -1) {
        const newList = [...list];
        newList[index] = updated;
        return newList;
      }
      return [...list, updated];
    });
  }

  private getEmptyProduct(): IProductDto {
    return {
      id: 0,
      title: '',
      description: '',
      price: 0,
      isValid: true,
      operationType: OperationType.Create,
    };
  }

  private loadProducts(): void {
    const url = 'product';
    this.http.get<IProductDto[]>(url).subscribe((res) => {
      this.products.set(res.filter((x) => !x.isDeleted));
    });
  }
}
