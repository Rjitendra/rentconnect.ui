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
    // children: [
    //   {
    //     name: 'Ongoing Tenancy',
    //     url: '/landlord/tenant/ongoing',
    //   },
    //   {
    //     name: 'Add Tenant',
    //     url: '/landlord/tenant/add',
    //   },
    //   {
    //     name: 'Issue Tracker',
    //     url: '/landlord/tenant/issue-tracker',
    //   },
    // ],
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

];
