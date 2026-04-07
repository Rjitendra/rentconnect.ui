import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgCheckbox } from './ng-checkbox';

const meta: Meta<any> = {
  title: 'Shared/Checkbox',
  component: NgCheckbox,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgCheckbox] })],
  parameters: { layout: 'padded' },
  args: {
    label: 'Send renewal reminders',
    uniqueId: 'renewal-reminders',
    toolTip: 'Notify tenants before expiry',
    clarifyText: 'Useful for automated follow-ups.',
    color: 'primary',
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};

export const Toggle: Story = {
  args: {
    label: 'Auto-approve minor maintenance',
    uniqueId: 'auto-approve',
    isToggle: true,
  },
};
