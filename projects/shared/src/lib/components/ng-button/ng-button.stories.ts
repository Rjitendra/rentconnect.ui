import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgButton } from './ng-button';

const meta: Meta<any> = {
  title: 'Shared/Button',
  component: NgButton,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgButton] })],
  parameters: { layout: 'centered' },
  args: {
    label: 'Save changes',
    type: 'filled',
    icon: 'save',
    tooltip: 'Save the form',
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};

export const Icon: Story = {
  args: {
    type: 'icon',
    label: 'Delete',
    icon: 'delete',
    tooltip: 'Delete item',
  },
};
