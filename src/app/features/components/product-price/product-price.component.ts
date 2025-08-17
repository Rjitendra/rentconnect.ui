import { Component, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface Product {
  name: string;
  price: number;
  quantity: number;
}
@Component({
  selector: 'ng-product-price',
  imports: [],
  templateUrl: './product-price.component.html',
  styleUrl: './product-price.component.scss',
})
export class ProductPriceComponent {
  // 8️⃣ Watch side-effects
  logEffect = effect(() => {
    console.log(`💬 Recalculated total: ₹${this.finalTotal()}`);
  });

  // 1️⃣ Create a signal for the product list
  products = signal<Product[]>([
    { name: 'Laptop', price: 60000, quantity: 1 },
    { name: 'Phone', price: 30000, quantity: 2 },
  ]);

  // 2️⃣ Create a signal for discount % (coming from observable later)
  remoteDiscount$: Observable<number> = timer(0, 5000).pipe(
    // Simulate discount changing every 5s
    switchMap(() => of(Math.floor(Math.random() * 20) + 5)), // 5% to 25%
  );

  // 3️⃣ Convert observable to signal
  discountPercent = toSignal(this.remoteDiscount$, { initialValue: 10 });

  // 4️⃣ Create a derived signal: subtotal
  subTotal = computed(() => this.products().reduce((total, p) => total + p.price * p.quantity, 0));

  // 5️⃣ Derived signal: discount amount
  discountAmount = computed(() => Math.floor(this.subTotal() * (this.discountPercent() / 100)));

  // 6️⃣ Final total after discount
  finalTotal = computed(() => this.subTotal() - this.discountAmount());

  // 7️⃣ Update quantity of a product
  changeQuantity(index: number, newQty: number) {
    const current = this.products();
    const updated = [...current];
    updated[index] = { ...updated[index], quantity: +newQty };
    this.products.set(updated);
  }
}
