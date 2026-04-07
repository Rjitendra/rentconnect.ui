import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgRadioGroupComponent, RadioOption } from './ng-radio-group.component';

const options: RadioOption[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const meta: Meta<any> = {
  title: 'Shared/Radio Group',
  component: NgRadioGroupComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgRadioGroupComponent] })],
  parameters: { layout: 'padded' },
  args: {
    groupLabel: 'Billing cycle',
    options,
    name: 'billing-cycle',
    toolTip: 'Choose how often rent is billed',
    clarifyText: 'Annual billing applies only to long-term contracts.',
    hint: 'Most leases use monthly billing.',
    ariaLabel: 'Billing cycle',
    ariaLabelledBy: 'billing-cycle',
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
