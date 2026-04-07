import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import {
  NgAdvancedCard,
  NgAdvancedCardAction,
} from './ng-advanced-card';

const actions: NgAdvancedCardAction[] = [
  { label: 'Approve', action: 'approve', type: 'primary', icon: 'check' },
  { label: 'Later', action: 'later', type: 'secondary' },
];

const meta: Meta<any> = {
  title: 'Shared/Advanced Card',
  component: NgAdvancedCard,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgAdvancedCard] })],
  parameters: { layout: 'padded' },
  args: {
    title: 'Lease Renewal',
    subtitle: 'Apartment 12B',
    headerIcon: 'home',
    appearance: 'outlined',
    actions,
    showFooter: true,
    footerIcon: 'schedule',
    footerText: 'Updated by property manager',
    showTimestamp: true,
    timestamp: new Date('2026-04-05T09:30:00'),
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ng-advanced-card
        [title]="title"
        [subtitle]="subtitle"
        [headerIcon]="headerIcon"
        [appearance]="appearance"
        [actions]="actions"
        [showFooter]="showFooter"
        [footerIcon]="footerIcon"
        [footerText]="footerText"
        [showTimestamp]="showTimestamp"
        [timestamp]="timestamp"
      >
        <p>Tenant requested a 12 month renewal with parking included.</p>
      </ng-advanced-card>
    `,
  }),
};
