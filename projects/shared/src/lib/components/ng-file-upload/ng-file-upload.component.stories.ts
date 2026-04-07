import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { NgFileUploadComponent } from './ng-file-upload.component';

const meta: Meta<any> = {
  title: 'Shared/File Upload',
  component: NgFileUploadComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NgFileUploadComponent] })],
  parameters: { layout: 'padded' },
  args: {
    label: 'Property photos',
    dragText: 'Drop listing images here or click to browse',
    toolTip: 'Upload JPG or PNG files',
    clarifyText: 'The first image is treated as the primary thumbnail.',
    hint: 'Up to 5 files, 2 MB each',
    config: {
      allowMultiple: true,
      acceptedTypes: ['image/*'],
      maxFiles: 5,
      maxFileSize: 2 * 1024 * 1024,
    },
  },
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {};
