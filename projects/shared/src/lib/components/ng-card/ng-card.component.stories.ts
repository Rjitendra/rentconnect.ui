import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgCardComponent } from './ng-card.component';

const meta: Meta<any> = {
  title: 'Shared/Card',
  component: NgCardComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgCardComponent] })],
  parameters: { layout: 'padded' },
  args: {
    title: 'Property Summary',
    subtitle: 'Downtown portfolio',
    icon: 'apartment',
    appearance: 'outlined',
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ng-card
        [title]="title"
        [subtitle]="subtitle"
        [icon]="icon"
        [appearance]="appearance"
      >
        <p>Occupancy is at 94% with three renewals pending review.</p>
      </ng-card>
    `,
  }),
};
