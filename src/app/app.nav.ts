import { INav } from '../../projects/shared/src/public-api';

export const NAVITEMS: INav[] = [
  {
    name: 'Home',
    url: '',
    icon: 'home',
  },

  {
    name: 'Property Manager',
    url: 'landlord/property',
    icon: 'apartment',
  },
  {
    name: 'Tenant Manager',
    icon: 'people',
    url: '/landlord/tenant',
    children: [
      {
        name: 'Ongoing Tenancy',
        url: '/landlord/tenant/ongoing',
      },
      {
        name: 'Add Tenant',
        url: '/landlord/tenant/add',
      },
      {
        name: 'Issue Tracker',
        url: '/landlord/tenant/issue-tracker',
      },
    ],
  },
  {
    name: 'Reports',
    icon: 'assessment',
    url: '/landlord/report',
    children: [
      {
        name: 'View Rent Report',
        url: '/landlord/report/rent-report',
      },
      {
        name: 'View Issue Report',
        url: '/landlord/report/issue-report',
      },
    ],
  },
  {
    name: 'About',
    url: 'about',
    icon: 'info',
  },
  {
    name: 'Contact',
    url: 'contact',
    icon: 'contact_phone',
  },

  {
    name: 'Express Builder',
    icon: 'apartment',
    url: 'express-builder',
  },
  {
    name: 'Change Detection',
    url: 'cd',
  },
  {
    name: 'Interview Questions',
    icon: 'quiz',
    url: 'interview-questions',
  },
  {
    name: 'Articles',
    icon: 'article',
    url: '',
    children: [
      {
        name: 'Angular',
        icon: '',
      },
      {
        name: 'Angular Signal',
        icon: '',
        url: 'article/signal',
      },
      {
        name: 'RXJS',
        icon: '',
        url: 'article/rxjs',
      },
      {
        name: 'NGRX',
        icon: '',
      },
      {
        name: 'Angular CLI',
        icon: '',
        url: '',
      },
      {
        name: 'NX',
        icon: '',
        url: '',
      },
    ],
  },
  {
    name: 'Product',
    url: 'product',
    icon: 'shopping_cart',
  },
  {
    name: 'Product',
    url: 'product-price',
    icon: 'price_change',
  },
];
