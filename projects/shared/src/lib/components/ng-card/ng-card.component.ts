import { Component, input } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ng-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule
],
  templateUrl: './ng-card.component.html',
  styleUrl: './ng-card.component.scss'
})
export class NgCardComponent {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly icon = input<string>();
  readonly appearance = input<'raised' | 'outlined'>('raised');
  readonly class = input<string>();
}
