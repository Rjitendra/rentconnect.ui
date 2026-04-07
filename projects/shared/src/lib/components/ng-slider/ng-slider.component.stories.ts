import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgSliderComponent } from './ng-slider.component';

const meta: Meta<any> = {
  title: 'Shared/Slider',
  component: NgSliderComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgSliderComponent] })],
  parameters: { layout: 'padded' },
  args: {
    label: 'Security deposit',
    min: 0,
    max: 5000,
    step: 250,
    uniqueId: 'security-deposit',
    name: 'securityDeposit',
    toolTip: 'Adjust the deposit amount',
    clarifyText: 'Most units use one month of rent.',
    hint: 'Drag to update the amount.',
    valueUnit: ' USD',
    displayValue: 1500,
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
