import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

export interface FileUploadConfig {
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[]; // ['image/*', '.pdf', etc.]
  maxFiles?: number;
  allowMultiple?: boolean;
}

export interface UploadedFile {
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
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    NgLabelComponent,
    NgClarifyTextComponent
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
export class NgFileUploadComponent implements ControlValueAccessor {
  @Input() label!: string;
  @Input() config: FileUploadConfig = {};
  @Input() disabled = false;
  @Input() required = false;
  @Input() dragText!: string;
  @Input() allowRemove = true;
  @Input() toolTip!: string;
  @Input() clarifyText!: string;
  @Input() hint!: string;
  
  @Output() filesSelected = new EventEmitter<UploadedFile[]>();
  @Output() fileRemoved = new EventEmitter<UploadedFile>();
  @Output() uploadProgress = new EventEmitter<{ file: UploadedFile; progress: number }>();
  @Output() uploadError = new EventEmitter<{ file: UploadedFile; error: string }>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  uploadedFiles: UploadedFile[] = [];
  isDragOver = false;

  private onChange = (value: UploadedFile[]) => {};
  private onTouched = () => {};

  get acceptedTypesString(): string {
    return this.config.acceptedTypes?.join(',') || '';
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
    this.disabled = isDisabled;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled) {
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
    
    if (this.disabled) return;
    
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
    event.stopPropagation();
    const index = this.uploadedFiles.indexOf(file);
    if (index >= 0) {
      this.uploadedFiles.splice(index, 1);
      this.onChange(this.uploadedFiles);
      this.fileRemoved.emit(file);
    }
  }

  private processFiles(files: File[]): void {
    for (const file of files) {
      if (this.validateFile(file)) {
        const uploadedFile: UploadedFile = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          url: this.createFileUrl(file)
        };
        
        if (!this.config.allowMultiple) {
          this.uploadedFiles = [uploadedFile];
        } else {
          if (!this.config.maxFiles || this.uploadedFiles.length < this.config.maxFiles) {
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
    if (this.config.maxFileSize && file.size > this.config.maxFileSize) {
      this.uploadError.emit({
        file: { file, name: file.name, size: file.size, type: file.type },
        error: `File size exceeds ${this.formatFileSize(this.config.maxFileSize)}`
      });
      return false;
    }
    
    // Check file type
    if (this.config.acceptedTypes && this.config.acceptedTypes.length > 0) {
      const isAccepted = this.config.acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });
      
      if (!isAccepted) {
        this.uploadError.emit({
          file: { file, name: file.name, size: file.size, type: file.type },
          error: 'File type not accepted'
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
    if (type.includes('word') || type.includes('document')) return 'description';
    if (type.includes('sheet') || type.includes('excel')) return 'table_chart';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'slideshow';
    return 'insert_drive_file';
  }
}