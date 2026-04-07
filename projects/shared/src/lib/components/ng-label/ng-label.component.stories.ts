import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgLabelComponent } from './ng-label.component';

const meta: Meta<any> = {
  title: 'Shared/Label',
  component: NgLabelComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgLabelComponent] })],
  parameters: { layout: 'centered' },
  args: {
    label: 'Lease status',
    required: true,
    toolTip: 'This field is required',
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
