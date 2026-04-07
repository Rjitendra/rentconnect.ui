import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgStepperComponent } from './ng-stepper.component';

const meta: Meta<any> = {
  title: 'Shared/Stepper',
  component: NgStepperComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgStepperComponent] })],
  parameters: { layout: 'padded' },
  args: {
    steps: [
      { label: 'Property details', completed: true },
      { label: 'Pricing', completed: false },
      { label: 'Publish', completed: false },
    ],
    orientation: 'horizontal',
    selectedIndex: 1,
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
