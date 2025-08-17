import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';

import { ChildComponent } from './child/child.component';
import { ICourse } from './cource';

@Component({
  selector: 'ng-change-detection',
  imports: [ChildComponent],
  templateUrl: './change-detection.component.html',
  styleUrl: './change-detection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeDetectionComponent implements OnInit {
  courses: ICourse[] = [
    { id: 1, name: 'Angular For Beginners' },
    { id: 2, name: 'Angular Core Deep Dive' },
    { id: 3, name: 'Angular Forms In Depth' },
  ];
  private $cd = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit() {
    this.autoUpdate();
  }
  autoUpdate() {
    setTimeout(() => {
      this.courses = [...this.courses, { id: 4, name: 'Updated course' }];
      this.$cd.detectChanges();
      // No cd.markForCheck() or cd.detectChanges()
    }, 1000);
  }
  // 1. No manual CD call - view will NOT update immediately
  updateWithoutMarkForCheck() {
    setTimeout(() => {
      this.courses = [...this.courses, { id: 4, name: 'Updated course' }];
      //   this.courses.push({
      //     id: 5, name: 'Updated course 2',
      //   });
      // this.$cd.detectChanges();
      // No cd.markForCheck() or cd.detectChanges()
    }, 200);
  }

  // 2. Using markForCheck() - schedules CD on next cycle - view WILL update soon after
  updateWithMarkForCheck() {
    this.courses = [
      { ...this.courses[0], name: 'Updated WITH markForCheck' },
      ...this.courses.slice(1),
    ];
    // setTimeout(() => {
    //   this.courses = [
    //     { ...this.courses[0], name: 'Updated WITH markForCheck' },
    //     ...this.courses.slice(1),
    //   ];
    //   this.$cd.markForCheck();
    // }, 200);
  }

  // 3. Using detectChanges() - runs CD immediately - view updates right away
  updateWithDetectChanges() {
    setTimeout(() => {
      this.courses[0].name = 'Updated WITH detectChanges';
      this.$cd.detectChanges(); // Runs CD now, view updates immediately
    }, 200);
  }
}
