import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/components/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/components/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/components/contact/contact.component').then((m) => m.ContactComponent),
      },
      {
        path: 'express-builder',
        loadComponent: () =>
          import('./features/components/express-builder/express-builder.component').then(
            (m) => m.ExpressBuilderComponent,
          ),
      },
      {
        path: 'interview-questions',
        loadComponent: () =>
          import('./features/components/interview-question/interview-question.component').then(
            (m) => m.InterviewQuestionComponent,
          ),
      },
      {
        path: 'articles/form/template-driven',
        loadComponent: () =>
          import('./features/components/template-driven-form/template-driven-form.component').then(
            (m) => m.TemplateDrivenFormComponent,
          ),
      },
      {
        path: 'articles/form/reactive',
        loadComponent: () =>
          import('./features/components/express-builder/express-builder.component').then(
            (m) => m.ExpressBuilderComponent,
          ),
      },
      {
        path: 'moments',
        loadComponent: () =>
          import('./features/components/moments/moments.component').then((m) => m.MomentsComponent),
      },
      {
        path: 'article/rxjs',
        loadComponent: () =>
          import('./features/components/rxjs/rxjs.component').then((m) => m.RxjsComponent),
      },
      {
        path: 'cd',
        loadComponent: () =>
          import('./features/components/change-detection/change-detection.component').then(
            (m) => m.ChangeDetectionComponent,
          ),
      },
      {
        path: 'product',
        loadComponent: () =>
          import('./features/components/product-crud/product-crud.component').then(
            (m) => m.ProductCrudComponent,
          ),
      },
      {
        path: 'product-price',
        loadComponent: () =>
          import('./features/components/product-price/product-price.component').then(
            (m) => m.ProductPriceComponent,
          ),
      },
      {
        path: 'article/signal',
        loadComponent: () =>
          import('./features/components/signal/signal.component').then((m) => m.SignalComponent),
      },
    ],
  },
];
