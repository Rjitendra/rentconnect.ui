import { Component, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { delay, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { AlertService, NgTreeComponent } from '../../../../../projects/shared/src/public-api';


interface Course {
  id: number;
  name: string;
}
@Component({
  selector: 'ng-express-builder',
  imports: [NgTreeComponent],
  templateUrl: './express-builder.component.html',
  styleUrl: './express-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpressBuilderComponent {
  courses: Course[] = [
    { id: 1, name: 'Angular For Beginners' },
    { id: 2, name: 'Angular Core Deep Dive' },
    { id: 3, name: 'Angular Forms In Depth' },
  ];
  private alertService = inject(AlertService);
  private $cd = inject(ChangeDetectorRef);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.rxjsExample();
  }

  // 1. No manual CD call - view will NOT update immediately
  updateWithoutMarkForCheck() {
    setTimeout(() => {
      this.courses[0].name = 'Updated WITHOUT markForCheck';
      // No cd.markForCheck() or cd.detectChanges()
      // View might NOT update immediately because OnPush CD doesn't detect mutation here
    }, 1000);
  }

  // 2. Using markForCheck() - schedules CD on next cycle - view WILL update soon after
  updateWithMarkForCheck() {
    setTimeout(() => {
      this.courses[0].name = 'Updated WITH markForCheck';
      this.$cd.markForCheck(); // Schedules this component for CD on next cycle
    }, 1000);
  }

  // 3. Using detectChanges() - runs CD immediately - view updates right away
  updateWithDetectChanges() {
    setTimeout(() => {
      this.courses[0].name = 'Updated WITH detectChanges';
      this.$cd.detectChanges(); // Runs CD now, view updates immediately
    }, 1000);
  }

  trackCourse(index: number, course: Course) {
    return course.id;
  }
  showAlert() {
    this.alertService.info({
      errors: [{ message: 'This is an info alert' }],
      timeout: 5000,
    });
    this.alertService.success({
      errors: [{ message: 'This is a success alert' }],
      timeout: 5000,
    });
    this.alertService.warning({
      errors: [{ message: 'This is a warning alert' }],
      timeout: 5000,
    });
    this.alertService.error({
      errors: [{ message: 'This is an error alert' }],
    });
    //  this.$cd.detectChanges();
  }

  rxjsExample() {
    // First set of parallel calls
    const fetchUserInfo$ = of({ id: 1, name: 'John Doe' }).pipe(delay(1000));
    const fetchAccountSettings$ = of({ theme: 'dark', language: 'en' }).pipe(delay(1200));

    // Second set of parallel calls (might depend on user info)
    const fetchUserOrders$ = of([
      { id: 101, item: 'Laptop', amount: 1200 },
      { id: 102, item: 'Phone', amount: 800 },
    ]).pipe(delay(800));

    const fetchUserNotifications$ = of([
      { id: 201, message: 'Order shipped', read: false },
      { id: 202, message: 'New support message', read: true },
    ]).pipe(delay(900));

    // Execute first forkJoin, then second one
    forkJoin({
      user: fetchUserInfo$,
      settings: fetchAccountSettings$,
    })
      .pipe(
        switchMap((user, settings) => {
          console.log('✅ First forkJoin result:', user, settings);
          // First forkJoin completed, now we can start the second one

          // Second forkJoin starts after first completes
          return forkJoin({
            orders: fetchUserOrders$,
            notifications: fetchUserNotifications$,
            user: of(user),
            settings: of(settings),
          }).pipe(
            tap(() => {
              console.log('Second forkJoin completed');
            }),
            map(
              ({
                orders,
                notifications,
                user,
                settings,
              }: {
                orders: unknown;
                notifications: unknown;
                user: unknown;
                settings: unknown;
              }) => ({
                orders,
                notifications,
                user,
                settings,
              }),
            ),
          );
        }),
      )
      .subscribe((result) => {
        console.log('✅ Second forkJoin result:', result);
      });
  }
}
