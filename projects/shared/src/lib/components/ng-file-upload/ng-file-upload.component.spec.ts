import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgFileUploadComponent, UploadedFile, FileUploadConfig } from './ng-file-upload.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgLabelComponent } from '../ng-label/ng-label.component';
import { NgClarifyTextComponent } from '../ng-clarify-text/ng-clarify-text.component';

describe('NgFileUploadComponent', () => {
  let component: NgFileUploadComponent;
  let fixture: ComponentFixture<NgFileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgFileUploadComponent,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        NgLabelComponent,
        NgClarifyTextComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle value changes', () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const testFiles: UploadedFile[] = [{
      file: mockFile,
      name: 'test.txt',
      size: 4,
      type: 'text/plain'
    }];
    
    component.writeValue(testFiles);
    expect(component.uploadedFiles).toEqual(testFiles);
  });

  it('should format file size correctly', () => {
    expect(component.formatFileSize(0)).toBe('0 Bytes');
    expect(component.formatFileSize(1024)).toBe('1 KB');
    expect(component.formatFileSize(1048576)).toBe('1 MB');
  });

  it('should get correct file icon for different types', () => {
    expect(component.getFileIcon('image/jpeg')).toBe('image');
    expect(component.getFileIcon('video/mp4')).toBe('video_file');
    expect(component.getFileIcon('application/pdf')).toBe('picture_as_pdf');
    expect(component.getFileIcon('text/plain')).toBe('insert_drive_file');
  });

  it('should remove file correctly', () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const uploadedFile: UploadedFile = {
      file: mockFile,
      name: 'test.txt',
      size: 4,
      type: 'text/plain'
    };
    
    component.uploadedFiles = [uploadedFile];
    spyOn(component.fileRemoved, 'emit');
    
    const mockEvent = new Event('click');
    spyOn(mockEvent, 'stopPropagation');
    
    component.removeFile(uploadedFile, mockEvent);
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.fileRemoved.emit).toHaveBeenCalledWith(uploadedFile);
    expect(component.uploadedFiles.length).toBe(0);
  });

  it('should set disabled state correctly', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });

  it('should handle drag events', () => {
    const mockEvent = new DragEvent('dragover');
    spyOn(mockEvent, 'preventDefault');
    
    component.onDragOver(mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(component.isDragOver).toBe(true);
  });

  it('should validate accepted types string', () => {
    const config: FileUploadConfig = {
      acceptedTypes: ['image/*', '.pdf', '.doc']
    };
    component.config = config;
    
    expect(component.acceptedTypesString).toBe('image/*,.pdf,.doc');
  });
});