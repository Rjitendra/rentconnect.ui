import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgIconComponent } from './ng-icon';

const meta: Meta<any> = {
  title: 'Shared/Icon',
  component: NgIconComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgIconComponent] })],
  parameters: { layout: 'centered' },
  args: {
    name: 'home',
    size: 'large',
    color: '#1565c0',
    tooltip: 'Home',
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
