import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';
import { NgLabelComponent } from '../ng-label/ng-label.component';

export interface FileUploadConfig {
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[]; // ['image/*', '.pdf', etc.]
  maxFiles?: number;
  allowMultiple?: boolean;
}

export interface UploadedFile {
  id?: number;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string; // for preview
  progress?: number; // for upload progress
  error?: string;
}

@Component({
  selector: 'ng-file-upload',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    NgLabelComponent,
    NgClarifyTextComponent,
  ],
  templateUrl: './ng-file-upload.component.html',
  styleUrl: './ng-file-upload.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgFileUploadComponent),
      multi: true,
    },
  ],
})
export class NgFileUploadComponent
  implements ControlValueAccessor, AfterViewInit
{
  readonly fileInputRef =
    viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  readonly label = input<string>('');
  readonly config = input<FileUploadConfig>({});
  readonly disabled = input(false);
  readonly required = input(false);
  readonly dragText = input<string>('Drop files here');
  readonly allowRemove = input(true);
  readonly toolTip = input<string>('');
  readonly clarifyText = input<string>('');
  readonly hint = input<string>('');

  readonly filesSelected = output<UploadedFile[]>();
  readonly fileRemoved = output<{ file: UploadedFile; index: number }>();

  readonly uploadProgress = output<{
    file: UploadedFile;
    progress: number;
  }>();
  readonly uploadError = output<{
    file: UploadedFile;
    error: string;
  }>();

  uploadedFiles: UploadedFile[] = [];
  isDragOver = false;

  private onChange = (value: UploadedFile[]) => {};
  private onTouched = () => {};

  ngAfterViewInit(): void {
    // ViewChild is now available
  }

  get acceptedTypesString(): string {
    return this.config().acceptedTypes?.join(',') || '';
  }

  writeValue(value: UploadedFile[]): void {
    this.uploadedFiles = value || [];
  }

  registerOnChange(fn: (value: UploadedFile[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // this.disabled = isDisabled;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) {
      this.isDragOver = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    if (this.disabled()) return;

    const files = Array.from(event.dataTransfer?.files || []);
    this.processFiles(files);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.processFiles(files);
    input.value = ''; // Reset input
  }

  removeFile(file: UploadedFile, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const index = this.uploadedFiles.indexOf(file);
    if (index >= 0) {
      this.uploadedFiles.splice(index, 1);
      this.onChange(this.uploadedFiles);
      // Emit both file and index
      this.fileRemoved.emit({ file, index });
    }
  }

  onUploadAreaClick(event: Event): void {
    if (this.disabled()) {
      return;
    }

    event.stopPropagation();

    // Create a temporary file input element
    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.multiple = this.config().allowMultiple || false;
    tempInput.accept = this.acceptedTypesString;
    tempInput.style.display = 'none';

    // Add event listener for file selection
    tempInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);
        this.processFiles(files);

        // Update the main form control
        this.onChange(this.uploadedFiles);
        this.filesSelected.emit(this.uploadedFiles);
        this.onTouched();
      }

      // Clean up
      document.body.removeChild(tempInput);
    });

    // Add to DOM and trigger click
    document.body.appendChild(tempInput);
    tempInput.click();
  }

  triggerFileInput(): void {
    const fileInputRef = this.fileInputRef();
    if (fileInputRef && fileInputRef.nativeElement) {
      fileInputRef.nativeElement.click();
    }
  }

  openFileDialog(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Use the same temporary input approach
    this.onUploadAreaClick(event);
  }

  private processFiles(files: File[]): void {
    for (const file of files) {
      if (this.validateFile(file)) {
        const uploadedFile: UploadedFile = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          url: this.createFileUrl(file),
        };

        const config = this.config();
        if (!config.allowMultiple) {
          this.uploadedFiles = [uploadedFile];
        } else {
          if (!config.maxFiles || this.uploadedFiles.length < config.maxFiles) {
            this.uploadedFiles.push(uploadedFile);
          }
        }
      }
    }

    this.onChange(this.uploadedFiles);
    this.filesSelected.emit(this.uploadedFiles);
    this.onTouched();
  }

  private validateFile(file: File): boolean {
    // Check file size
    const config = this.config();
    if (config.maxFileSize && file.size > config.maxFileSize) {
      this.uploadError.emit({
        file: { file, name: file.name, size: file.size, type: file.type },
        error: `File size exceeds ${this.formatFileSize(config.maxFileSize)}`,
      });
      return false;
    }

    // Check file type
    if (config.acceptedTypes && config.acceptedTypes.length > 0) {
      const isAccepted = config.acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });

      if (!isAccepted) {
        this.uploadError.emit({
          file: { file, name: file.name, size: file.size, type: file.type },
          error: 'File type not accepted',
        });
        return false;
      }
    }

    return true;
  }

  private createFileUrl(file: File): string {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(type: string): string {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video_file';
    if (type.startsWith('audio/')) return 'audio_file';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('word') || type.includes('document'))
      return 'description';
    if (type.includes('sheet') || type.includes('excel')) return 'table_chart';
    if (type.includes('presentation') || type.includes('powerpoint'))
      return 'slideshow';
    return 'insert_drive_file';
  }

  areFilesImages(): boolean {
    return (
      this.uploadedFiles.length > 0 &&
      this.uploadedFiles.every((file) => file.type.startsWith('image/'))
    );
  }
}
