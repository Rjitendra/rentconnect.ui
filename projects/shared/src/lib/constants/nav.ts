import { INav } from '../models/inav';

export const navItems: INav[] = [
  {
    name: 'Home1',
    url: '',
    icon: 'home',
  },
  {
    name: 'Express Builder',
    icon: 'apartment',
    url: '/landlord/property',
  },
  {
    name: 'Interview Questions Interview Questions',
    icon: 'apartment',
    url: '',
  },
  {
    name: 'Concepts',
    icon: 'people',
    url: '/landlord/tenant',
    expanded: false,
    children: [
      {
        name: 'Forms',
        url: '/landlord/tenant/ongoing',
        children: [
          {
            name: 'Template Driven',
            url: '/landlord/tenant/add',
          },
          {
            name: 'Reactive',
            url: '/landlord/tenant/issue-tracker',
          },
        ],
      },
    ],
  },
  {
    name: 'Routing',
    icon: 'assessment',
    url: '/landlord/report',
    expanded: false,
    children: [
      {
        name: 'View Rent Report',
        url: '',
      },
      {
        name: 'View Issue Report',
        url: '',
      },
    ],
  },
];
