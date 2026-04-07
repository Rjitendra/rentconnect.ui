import { of } from 'rxjs';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgAlertComponent } from './ng-alert.component';
import { AlertService } from '../../services/alert.service';

const meta: Meta<any> = {
  title: 'Shared/Alert',
  component: NgAlertComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NgAlertComponent],
      providers: [
        {
          provide: AlertService,
          useValue: {
            getAlert: () =>
              of({
                errors: [
                  {
                    errorType: 'warning',
                    message:
                      'Lease is expiring soon.\nReview the pending renewal request.',
                  },
                ],
                timeout: 0,
              }),
          },
        },
      ],
    }),
  ],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
