import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgDialog } from './ng-dialog';

const meta: Meta<any> = {
  title: 'Shared/Dialog',
  component: NgDialog,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NgDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Delete listing',
            message: 'This action removes the listing from the active feed.',
            confirmText: 'Delete',
            cancelText: 'Keep',
            icon: 'warning',
            type: 'warning',
          },
        },
        {
          provide: MatDialogRef,
          useValue: { close: () => undefined },
        },
      ],
    }),
  ],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
