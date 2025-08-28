import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const meta: Meta = {
  title: 'Form Controls/Material Input',
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
      ],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Text: Story = {
  name: 'Text Input',
  render: () => ({
    template: `
      <mat-form-field appearance="outline">
        <mat-label>Name</mat-label>
        <input matInput placeholder="Enter your name" />
      </mat-form-field>
    `,
  }),
};

export const Password: Story = {
  name: 'Password Input',
  render: () => ({
    template: `
      <mat-form-field appearance="outline">
        <mat-label>Password</mat-label>
        <input matInput placeholder="Enter password" type="password" />
      </mat-form-field>
    `,
  }),
};

export const Disabled: Story = {
  name: 'Disabled Input',
  render: () => ({
    template: `
      <mat-form-field appearance="outline">
        <mat-label>Disabled</mat-label>
        <input matInput placeholder="You can’t type here" disabled />
      </mat-form-field>
    `,
  }),
};
