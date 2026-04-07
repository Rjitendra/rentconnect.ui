import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgClarifyTextComponent } from './ng-clarify-text.component';

const meta: Meta<any> = {
  title: 'Shared/Clarify Text',
  component: NgClarifyTextComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgClarifyTextComponent] })],
  parameters: { layout: 'centered' },
  args: {
    clarifyText: 'This fee is charged only for month-to-month leases.',
    isIconDisabled: false,
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
