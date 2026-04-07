import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { InputType } from '../../enums/input-type';
import { NgInputComponent } from './ng-input.component';

const meta: Meta<any> = {
  title: 'Shared/Input',
  component: NgInputComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgInputComponent] })],
  parameters: { layout: 'padded' },
  args: {
    label: 'Tenant email',
    placeholder: 'name@example.com',
    type: InputType.Email,
    prefixIcon: 'mail',
    hint: 'We use this for lease notifications.',
    autocomplete: 'email',
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};

export const WithSuffix: Story = {
  args: {
    label: 'Monthly rent',
    placeholder: '2500',
    type: InputType.Number,
    prefixText: '$',
    suffixText: 'USD',
  },
};
