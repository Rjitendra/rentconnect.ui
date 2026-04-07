import { of } from 'rxjs';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgSpinner } from './ng-spinner';
import { SpinnerService } from '../../services/ng-spinner.service';

const meta: Meta<any> = {
  title: 'Shared/Spinner',
  component: NgSpinner,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NgSpinner],
      providers: [
        {
          provide: SpinnerService,
          useValue: { loading$: of(true) },
        },
      ],
    }),
  ],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
