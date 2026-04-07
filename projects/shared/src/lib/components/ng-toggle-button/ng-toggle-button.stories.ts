import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgToggleButton } from './ng-toggle-button';

const meta: Meta<any> = {
  title: 'Shared/Toggle Button',
  component: NgToggleButton,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgToggleButton] })],
  parameters: { layout: 'centered' },
  args: {
    appearance: 'standard',
    options: [
      { label: 'Grid', value: 'grid' },
      { label: 'List', value: 'list' },
      { label: 'Map', value: 'map' },
    ],
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};

export const Multiple: Story = {
  args: {
    multiple: true,
    options: [
      { label: 'Parking', value: 'parking' },
      { label: 'Pets', value: 'pets' },
      { label: 'Pool', value: 'pool' },
    ],
  },
};
