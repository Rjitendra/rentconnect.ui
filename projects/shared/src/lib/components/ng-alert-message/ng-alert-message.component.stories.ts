import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgAlertMessageComponent } from './ng-alert-message.component';

const meta: Meta<any> = {
  title: 'Shared/Alert Message',
  component: NgAlertMessageComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgAlertMessageComponent] })],
  parameters: { layout: 'padded' },
  args: {
    alertType: 'success',
    id: 1,
    messageText: 'Application approved\nMove-in date confirmed',
    hideCloseButton: false,
    buttons: [
      {
        label: 'View lease',
        isButton: true,
        iconType: 'description',
        click: () => undefined,
      },
    ],
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
