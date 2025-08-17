import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { concat, delay, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

const numbers$ = of([1, 2, 3]); //emit single
// onst numbers$ = of(1, 2, 3); //emit multiple values
// const numbers$ = of(1, 2, 3).pipe(single()); //emit single value
// const numbers$ = of(1, 2, 3).pipe(single(2)); //emit single value with condition
// const numbers$ = of(1, 2, 3).pipe(single((value) => value > 2)); //emit single value with condition
// const numbers$ = of(1, 2, 3).pipe(single((value) => value > 2, () => 'No value emitted')); //emit single value with condition and default value
// const numbers$ = of(1, 2, 3).pipe(single((value) => value > 2, () => 'No value emitted', () => 'No value emitted')); //emit single value with condition and default value and error message
// const numbers$ = of(1, 2, 3).pipe(single((value) => value > 2, () => 'No value emitted', () => 'No value emitted', () => 'No value emitted')); //emit single value with condition and default value and error message and error message

@Component({
  selector: 'ng-rxjs',
  imports: [CommonModule],
  templateUrl: './rxjs.component.html',
  styleUrl: './rxjs.component.scss',
})
export class RxjsComponent implements OnInit {
  rxjsContent: string = `
  <!-- rxjs-overview.component.html -->
<div class="rxjs-container">
  <h1>🔄 What is RxJS?</h1>
  <p>RxJS (Reactive Extensions for JavaScript) is a powerful library for reactive programming using Observables. It allows you to work with asynchronous data streams like events, HTTP responses, form changes, and more.</p>

  <div class="rxjs-section">
    <h2>📦 Core Concepts of RxJS</h2>
    <div class="rxjs-subsection">
      <h3>1. Observable</h3>
      <p>An Observable represents a stream of data over time. It can emit zero, one, or multiple values, either synchronously or asynchronously.</p>
      <p><strong>Use case:</strong> HTTP requests, user inputs, timers, etc.</p>
      <pre><code>import { of } from 'rxjs';

const obs$ = of(1, 2, 3); // Emits 1, 2, 3
obs$.subscribe(value => console.log(value));</code></pre>
    </div>

    <div class="rxjs-subsection">
      <h3>2. Observer</h3>
      <p>An Observer defines how to handle the values emitted by an Observable. It has three callbacks:</p>
      <ul>
        <li><code>next()</code> → called on each value</li>
        <li><code>error()</code> → called on error</li>
        <li><code>complete()</code> → called when done</li>
      </ul>
      <pre><code>obs$.subscribe({
  next: val => console.log(val),
  error: err => console.error(err),
  complete: () => console.log('Done')
});</code></pre>
    </div>

    <div class="rxjs-subsection">
      <h3>3. Operators</h3>
      <p>Operators are functions that modify observables. You use them with <code>.pipe()</code>.</p>
      <h4>🔹 Categories of Operators:</h4>
      <ul>
        <li><strong>Creation:</strong> <code>of</code>, <code>from</code>, <code>interval</code></li>
        <li><strong>Transformation:</strong> <code>map</code>, <code>switchMap</code></li>
        <li><strong>Filtering:</strong> <code>filter</code>, <code>debounceTime</code></li>
        <li><strong>Combination:</strong> <code>merge</code>, <code>concat</code>, <code>combineLatest</code></li>
      </ul>
      <pre><code>import { from } from 'rxjs';
import { map, filter } from 'rxjs/operators';

from([1, 2, 3, 4])
  .pipe(
    filter(n => n % 2 === 0),
    map(n => n * 10)
  )
  .subscribe(console.log); // 20, 40</code></pre>
    </div>

    <div class="rxjs-subsection">
      <h3>4. Subject</h3>
      <p>A <strong>Subject</strong> is a special kind of Observable that is also an Observer. It allows multicasting to many observers.</p>
      <p><strong>Use case:</strong> Sharing data (e.g., event bus, shared state).</p>
      <pre><code>import { Subject } from 'rxjs';

const subject = new Subject();
subject.subscribe(val => console.log('A:', val));
subject.subscribe(val => console.log('B:', val));

subject.next(1); // A: 1, B: 1</code></pre>
    </div>

    <div class="rxjs-subsection">
      <h3>5. BehaviorSubject</h3>
      <p>A <strong>BehaviorSubject</strong> holds a current value and emits the latest value to new subscribers immediately.</p>
      <pre><code>import { BehaviorSubject } from 'rxjs';

const counter$ = new BehaviorSubject(0);
counter$.subscribe(val => console.log(val)); // 0
counter$.next(1);</code></pre>
    </div>
  </div>

  <div class="rxjs-section">
    <h2>🅰️ RxJS in Angular</h2>
    <p>RxJS is built into Angular, and you use it in many places:</p>
    <ul>
      <li>✅ <strong>HttpClient:</strong> <code>this.http.get().subscribe(...)</code></li>
      <li>✅ <strong>Reactive Forms:</strong> <code>formControl.valueChanges.subscribe(...)</code></li>
      <li>✅ <strong>Routing:</strong> <code>ActivatedRoute.params</code>, <code>queryParams</code></li>
      <li>✅ <strong>NgRx:</strong> state management using Actions and Effects</li>
    </ul>
  </div>
</div>

`;
  tape1!: number;
  data$!: Observable<number[]>;
  constructor() {}

  ngOnInit(): void {
    this.data$ = concat(numbers$).pipe(
      tap((value) => {
        //  this.tape1 = value;
        console.log('Value before map:', value);
      }),
      map((value) => {
        console.log('Value inside map:', value);
        return value; // Example transformation: double the value
      }),
      switchMap((value) => {
        console.log('Value inside switchMap:', value);
        return of(value);
      }),
    );

    // Mock services
    const getUserProfile = () => of({ userId: 1, name: 'John Doe' }).pipe(delay(500));

    const getUserProjects = () =>
      of([
        { projectId: 101, title: 'Project A' },
        { projectId: 102, title: 'Project B' },
      ]).pipe(delay(500));

    const getProjectDetails = (projectId: number) =>
      of({ projectId, description: `Details of project ${projectId}` }).pipe(delay(300));

    const getProjectStats = () =>
      forkJoin({
        stars: of(Math.floor(Math.random() * 100)).pipe(delay(200)),
        forks: of(Math.floor(Math.random() * 50)).pipe(delay(300)),
        watchers: of(Math.floor(Math.random() * 75)).pipe(delay(250)),
      });

    getUserProfile()
      .pipe(
        tap((user) => console.log('User Profile:', user)),

        switchMap(() =>
          getUserProjects().pipe(
            tap((projects) => console.log('User Projects:', projects)),

            // Fetch each project detail sequentially
            switchMap((projects) =>
              concat(
                ...projects.map((project) =>
                  getProjectDetails(project.projectId).pipe(
                    tap((detail) => console.log('Project Detail:', detail)),

                    // For each project detail, fetch stats concurrently
                    switchMap((detail) =>
                      getProjectStats().pipe(
                        tap((stats) => console.log('Project Stats:', stats)),

                        map((stats) => ({
                          ...detail,
                          stats,
                        })),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      )
      .subscribe((finalData) => {
        console.log('📦 Final Project Data with Stats:', finalData);
      });
  }
}
