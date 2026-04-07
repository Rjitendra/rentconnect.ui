import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgTextareaComponent } from './ng-textarea.component';

const meta: Meta<any> = {
  title: 'Shared/Textarea',
  component: NgTextareaComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgTextareaComponent] })],
  parameters: { layout: 'padded' },
  args: {
    label: 'Property description',
    placeholder: 'Write a listing summary',
    uniqueId: 'property-description',
    toolTip: 'Describe the unit clearly',
    clarifyText: 'Focus on layout, light, and neighborhood highlights.',
    hint: 'Aim for 100 to 200 characters.',
    rows: 5,
    maxLength: 240,
    showCharacterCount: true,
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
