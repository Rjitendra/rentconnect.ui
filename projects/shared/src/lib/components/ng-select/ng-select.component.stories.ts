import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgSelectComponent, SelectOption } from './ng-select.component';

const options: SelectOption[] = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Under maintenance' },
];

const meta: Meta<any> = {
  title: 'Shared/Select',
  component: NgSelectComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgSelectComponent] })],
  parameters: { layout: 'padded' },
  args: {
    label: 'Listing status',
    placeholder: 'Choose a status',
    options,
    uniqueId: 'listing-status',
    toolTip: 'Current property availability',
    clarifyText: 'Status controls where the listing appears.',
    hint: 'Set maintenance while repairs are pending.',
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};

export const Multiple: Story = {
  args: {
    label: 'Visible channels',
    multiple: true,
    options: [
      { value: 'web', label: 'Website' },
      { value: 'app', label: 'Mobile app' },
      { value: 'brokers', label: 'Broker portal' },
    ],
  },
};
