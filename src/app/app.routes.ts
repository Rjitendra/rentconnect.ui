import { Routes } from '@angular/router';




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
        loadComponent: () => import('./features/components/landlord/property/property-manager/property-manager').then(m => m.PropertyManager),
        children: [
          {
            path: 'property',
            loadComponent: () => import('./features/components/landlord/property/property-dashboard/property-dashboard').then(m => m.PropertyDashboard),
          },
          {
            path: 'tenant',
            loadComponent: () => import('./features/components/landlord/tenant/tenant-dashboard/tenant-dashboard').then(m => m.TenantDashboard),
          }
        ],
      },
    ],
  },
];
