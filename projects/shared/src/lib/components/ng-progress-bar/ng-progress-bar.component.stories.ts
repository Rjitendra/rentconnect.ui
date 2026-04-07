import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgProgressBarComponent } from './ng-progress-bar.component';

const meta: Meta<any> = {
  title: 'Shared/Progress Bar',
  component: NgProgressBarComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgProgressBarComponent] })],
  parameters: { layout: 'padded' },
  args: {
    label: 'Profile completion',
    value: 72,
    displayValue: 72,
    mode: 'determinate',
    color: 'primary',
    size: 'medium',
    toolTip: 'Completion percentage',
    clarifyText: 'Based on required onboarding steps.',
    hint: 'Complete KYC to reach 100%.',
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
