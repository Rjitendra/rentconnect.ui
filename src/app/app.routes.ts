import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { SigninCallback } from './oauth/components/signin-callback/signin-callback';
import { SignoutCallback } from './oauth/components/signout-callback/signout-callback';
import { userGuard } from './core/guards/user-guard';

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
    ],
    canActivate: [userGuard],
  },
  { path: 'signin-callback', component: SigninCallback },
  { path: 'signout-callback', component: SignoutCallback },
  { path: '**', redirectTo: '' },
];
