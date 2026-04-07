import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgMatTable } from './ng-mat-table';

const meta: Meta<any> = {
  title: 'Shared/Material Table',
  component: NgMatTable,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgMatTable] })],
  parameters: { layout: 'padded' },
  args: {
    columns: [
      { key: 'property', label: 'Property', sortable: true },
      { key: 'tenant', label: 'Tenant', sortable: true },
      { key: 'status', label: 'Status' },
      { key: 'rent', label: 'Rent', align: 'right', headerAlign: 'right' },
    ],
    data: [
      {
        property: 'Maple Residency',
        tenant: 'Ava Johnson',
        status: 'Active',
        rent: '$2,450',
      },
      {
        property: 'Lakeview Towers',
        tenant: 'Noah Patel',
        status: 'Pending',
        rent: '$1,980',
      },
    ],
    options: {
      responsive: true,
      pageSize: 5,
      pageSizeOptions: [5, 10, 20],
      multiSelect: true,
    },
    rowCheckbox: true,
    isPaginator: true,
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
