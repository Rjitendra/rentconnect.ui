import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnChanges,
  SimpleChanges,
  inject,
  input,
} from '@angular/core';

import { ICourse } from '../cource';

@Component({
  selector: 'ng-child',
  imports: [],
  templateUrl: './child.component.html',
  styleUrl: './child.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildComponent implements OnChanges {
  readonly courses = input.required<ICourse[]>();

  private $cd = inject(ChangeDetectorRef);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ChildComponent ngOnChanges:', changes);
  }
}
