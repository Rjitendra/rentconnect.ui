import { Routes } from '@angular/router';
import { PropertyManager } from './features/components/landlord/property/property-manager/property-manager';
import { PropertyDashboard } from './features/components/landlord/property/property-dashboard/property-dashboard';
import { TenantDashboard } from './features/components/landlord/tenant/tenant-dashboard/tenant-dashboard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/components/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },

      {
        path: 'landlord',
        component: PropertyManager,
        children: [
          {
            path: 'property',
            component: PropertyDashboard,
          },
          {
            path: 'tenant',
            component: TenantDashboard,
          }
        ],
      },
    ],
  },
];
