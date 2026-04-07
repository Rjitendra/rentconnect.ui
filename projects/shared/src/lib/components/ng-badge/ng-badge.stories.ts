import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgBadge } from './ng-badge';

const meta: Meta<any> = {
  title: 'Shared/Badge',
  component: NgBadge,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgBadge] })],
  parameters: { layout: 'centered' },
  args: {
    content: 7,
    color: 'warn',
    position: 'above after',
    size: 'medium',
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ng-badge
        [content]="content"
        [color]="color"
        [position]="position"
        [size]="size"
        [hidden]="hidden"
        [disabled]="disabled"
        [overlap]="overlap"
      >
        <button style="padding: 10px 18px;">Notifications</button>
      </ng-badge>
    `,
  }),
};
