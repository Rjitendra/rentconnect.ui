import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgTreeComponent } from './ng-tree.component';

const meta: Meta<any> = {
  title: 'Shared/Tree',
  component: NgTreeComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgTreeComponent] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
