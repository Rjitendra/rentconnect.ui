import { of } from 'rxjs';
import { Meta, StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LibLayoutComponent } from './ng-layout.component';
import { SpinnerService } from '../../services/ng-spinner.service';

const meta: Meta<any> = {
  title: 'Shared/Layout',
  component: LibLayoutComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAnimations(), provideRouter([])],
    }),
    moduleMetadata({
      imports: [LibLayoutComponent],
      providers: [
        {
          provide: SpinnerService,
          useValue: { loading$: of(false) },
        },
      ],
    }),
  ],
  parameters: { layout: 'fullscreen' },
  args: {
    navItems: [
      { name: 'Dashboard', url: '/dashboard', icon: 'dashboard' },
      {
        name: 'Properties',
        icon: 'apartment',
        expanded: true,
        children: [
          { name: 'All properties', url: '/properties', icon: 'home' },
          { name: 'Vacancies', url: '/vacancies', icon: 'meeting_room' },
        ],
      },
    ],
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ng-layout [navItems]="navItems"></ng-layout>
    `,
  }),
};
