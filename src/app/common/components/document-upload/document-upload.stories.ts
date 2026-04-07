import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DocumentCategory } from '../../../features/enums/view.enum';

import { DocumentUpload } from './document-upload';

const categories = [
  { value: DocumentCategory.Aadhaar, label: 'Aadhaar Card' },
  { value: DocumentCategory.EmploymentProof, label: 'Employment Proof' },
  { value: DocumentCategory.BankProof, label: 'Bank Statement' },
  { value: DocumentCategory.RentalAgreement, label: 'Rental Agreement' },
];

const meta: Meta<DocumentUpload> = {
  title: 'App/Common/Document Upload',
  component: DocumentUpload,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [DocumentUpload],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            tenantName: 'Priya Sharma',
            tenantIndex: 0,
            availableCategories: categories,
          },
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: () => undefined,
          },
        },
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<DocumentUpload>;

export const Default: Story = {};
