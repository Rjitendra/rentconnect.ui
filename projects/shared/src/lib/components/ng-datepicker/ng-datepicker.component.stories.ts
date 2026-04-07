import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgDatepickerComponent } from './ng-datepicker.component';

const meta: Meta<any> = {
  title: 'Shared/Datepicker',
  component: NgDatepickerComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgDatepickerComponent] })],
  parameters: { layout: 'padded' },
  args: {
    label: 'Move-in date',
    placeholder: 'Select a date',
    uniqueId: 'move-in-date',
    toolTip: 'Pick the tenant move-in date',
    clarifyText: 'Only dates within the next 90 days are allowed.',
    hint: 'Choose a weekday when possible.',
    minDate: new Date('2026-04-05'),
    maxDate: new Date('2026-07-05'),
    startAt: new Date('2026-04-15'),
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
