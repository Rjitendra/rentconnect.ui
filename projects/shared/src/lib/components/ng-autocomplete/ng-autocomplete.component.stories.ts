import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import {
  AutocompleteOption,
  NgAutocompleteComponent,
} from './ng-autocomplete.component';

const options: AutocompleteOption[] = [
  { value: 'tenant', label: 'Tenant' },
  { value: 'owner', label: 'Owner' },
  { value: 'vendor', label: 'Vendor' },
];

const meta: Meta<any> = {
  title: 'Shared/Autocomplete',
  component: NgAutocompleteComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgAutocompleteComponent] })],
  parameters: { layout: 'padded' },
  args: {
    label: 'Contact type',
    placeholder: 'Search a role',
    options,
    uniqueId: 'contact-type',
    toolTip: 'Choose the contact role',
    clarifyText: 'Typing filters the available options.',
    hint: 'Start typing to narrow the list.',
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
