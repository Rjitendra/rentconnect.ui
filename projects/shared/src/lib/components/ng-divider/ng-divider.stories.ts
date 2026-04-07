import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgDivider } from './ng-divider';

const meta: Meta<any> = {
  title: 'Shared/Divider',
  component: NgDivider,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgDivider] })],
  parameters: { layout: 'padded' },
  args: {
    vertical: false,
    inset: false,
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; gap: 16px;">
        <div>Primary details</div>
        <ng-divider [vertical]="vertical" [inset]="inset" [cssClass]="cssClass" />
        <div>Secondary details</div>
      </div>
    `,
  }),
};
