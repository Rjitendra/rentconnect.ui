import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { ChipOption, NgChipsComponent } from './ng-chips.component';

const availableOptions: ChipOption[] = [
  { value: 'parking', label: 'Parking' },
  { value: 'pets', label: 'Pets Allowed' },
  { value: 'furnished', label: 'Furnished' },
];

const meta: Meta<any> = {
  title: 'Shared/Chips',
  component: NgChipsComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgChipsComponent] })],
  parameters: { layout: 'padded' },
  args: {
    label: 'Amenities',
    placeholder: 'Add an amenity',
    availableOptions,
    toolTip: 'Select or create amenities',
    clarifyText: 'Press Enter to create a custom chip.',
    hint: 'Maximum 5 amenities',
    maxChips: 5,
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
