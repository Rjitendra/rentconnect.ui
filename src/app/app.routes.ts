import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { userGuard } from './core/guards/user-guard';
import { SigninCallback } from './oauth/components/signin-callback/signin-callback';
import { SignoutCallback } from './oauth/components/signout-callback/signout-callback';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/components/landing/landing').then(
        (m) => m.LandingComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'landlord',
    loadComponent: () =>
      import('./layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/components/home/home.component').then(
            (m) => m.HomeComponent,
          ),
      },
      {
        path: 'property',
        loadComponent: () =>
          import(
            './features/components/landlord/property/property-dashboard/property-dashboard'
          ).then((m) => m.PropertyDashboard),
      },
      {
        path: 'tenant',
        loadComponent: () =>
          import(
            './features/components/landlord/tenant/tenant-dashboard/tenant-dashboard'
          ).then((m) => m.TenantDashboard),
      },
      {
        path: 'issue-tracker',
        loadComponent: () =>
          import(
            './features/components/tracker/issue-tracker/issue-tracker'
          ).then((m) => m.IssueTracker),
      },
      {
        path: 'issue-tracker/history/:id',
        loadComponent: () =>
          import(
            './features/components/tracker/issue-tracker-history/issue-tracker-history'
          ).then((m) => m.IssueTrackerHistory),
      },
    ],
    canActivate: [userGuard],
  },
  { path: 'signin-callback', component: SigninCallback },
  { path: 'signout-callback', component: SignoutCallback },
  { path: '**', redirectTo: '' },
];
