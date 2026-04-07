import { Meta, StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgMenuComponent } from './ng-menu';
import { NgMenuTriggerDirective } from '../../directives/ng-menu-tigger.directive';
import { NgMenuItemDirective } from '../../directives/ng-menu-item.directive';

const meta: Meta<any> = {
  title: 'Shared/Menu',
  component: NgMenuComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: [provideAnimations()] }),
    moduleMetadata({
      imports: [
        OverlayModule,
        PortalModule,
        NgMenuComponent,
        NgMenuTriggerDirective,
        NgMenuItemDirective,
      ],
    }),
  ],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  render: () => ({
    template: `
      <button [ngMenuTriggerFor]="menu" style="padding: 10px 18px;">
        Open menu
      </button>

      <ng-menu #menu="ng-menu" panelClass="storybook-menu">
        <button ng-menu-item style="display: block; width: 100%; padding: 8px 12px;">
          Edit listing
        </button>
        <button ng-menu-item style="display: block; width: 100%; padding: 8px 12px;">
          Archive property
        </button>
      </ng-menu>
    `,
  }),
};
