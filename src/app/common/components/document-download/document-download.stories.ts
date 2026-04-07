import type { Meta, StoryObj } from '@storybook/angular';

import { DocumentDownload } from './document-download';

const meta: Meta<DocumentDownload> = {
  title: 'App/Common/Document Download',
  component: DocumentDownload,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'Signed lease agreement',
    description: 'Pull the latest PDF version shared with the tenant for review and archive.',
    fileName: 'signed-lease-agreement.pdf',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<DocumentDownload>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    title: 'Inspection summary',
    description: 'The report is still generating, so download is temporarily unavailable.',
    fileName: 'inspection-summary.pdf',
    fileType: 'Report',
    fileSize: 'Pending',
    disabled: true,
  },
};
