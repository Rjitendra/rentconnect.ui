import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  AlertService,
  UploadedFile,
} from '../../../../projects/shared/src/public-api';
import { environment } from '../../../environments/environment';
import { Result } from '../../common/models/common';
import { acceptedTypes } from '../constants/document.constants';
import { OwnerType } from '../constants/owner-type.constants';
import { DocumentCategory } from '../enums/view.enum';
import { IDocument } from '../models/document';
import { ILandlord } from '../models/landlord';

import { LandlordService } from './landlord.service';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly maxFiles = 10;
  private readonly acceptedTypes = acceptedTypes.filter((type) =>
    type.startsWith('image/'),
  );

  private landLordDetails!: ILandlord;

  private readonly alertService = inject(AlertService);

  private _http = inject(HttpClient);
  private landlordService = inject(LandlordService);

  setLandlordDetails(userId: number): Observable<Result<ILandlord>> {
    return this.landlordService.getLandlord(userId).pipe(
      map((landlord) => {
        this.landLordDetails = landlord.entity;
        return landlord;
      }),
    );
  }

  getLandlordDetails(): ILandlord {
    return this.landLordDetails;
  }

  /**
   * Validate uploaded files (size, type, count)
   */
  validateUploadedFiles(files: UploadedFile[]): UploadedFile[] {
    const validFiles: UploadedFile[] = [];
    for (const file of files) {
      let isValid = true;

      if (file.size > this.maxFileSize) {
        console.error(`File "${file.name}" exceeds max size`);
        isValid = false;
      }
      if (!this.acceptedTypes.includes(file.type)) {
        console.error(`File "${file.name}" has unsupported type`);
        isValid = false;
      }
      if (validFiles.length >= this.maxFiles) {
        console.warn(`Maximum ${this.maxFiles} files allowed`);
        break;
      }
      if (isValid) validFiles.push(file);
    }
    return validFiles;
  }

  /**
   * Convert uploaded images to document objects for backend
   */
  convertImagesToDocuments(
    uploadedImages: UploadedFile[],
    ownerId: number,
  ): IDocument[] {
    return uploadedImages.map((image, index) => ({
      ownerId: ownerId,
      ownerType: OwnerType.LANDLORD,
      category: DocumentCategory.PropertyImages,
      name: image.name,
      type: image.type,
      size: image.size,
      url: image.url,
      file: image.file,
      uploadedOn: new Date().toISOString(),
      isVerified: false,
      description:
        index === 0 ? 'Primary property image' : `Property image ${index + 1}`,
    }));
  }

  /**
   * Convert existing documents to UploadedFile[] for UI
   */
  loadExistingDocuments(documents: IDocument[]): UploadedFile[] {
    const imageDocuments = documents.filter(
      (doc) => doc.category === DocumentCategory.PropertyImages && doc.url,
    );
    return imageDocuments.map((doc, index) => ({
      id: doc.id,
      name: doc.name || `image_${index}`,
      size: doc.size || 0,
      type: doc.type || 'image/jpeg',
      url: doc.url!,
      uploadProgress: 100,
      isUploaded: true,
      file: new File([], doc.name || `image_${index}`, {
        type: doc.type || 'image/jpeg',
      }),
    }));
  }

  /**
   * Main method to download documents, filtered by category.
   * @param allDocuments The complete list of documents to search through.
   * @param category The category to filter by ('all' for all documents).
   */
  downloadDocumentsByCategory(
    allDocuments: IDocument[],
    category: DocumentCategory | 'all',
  ): void {
    if (!allDocuments || allDocuments.length === 0) {
      this.alertService.info({
        errors: [
          {
            message: 'No documents available for download.',
            errorType: 'info',
          },
        ],
      });
      return;
    }

    const documentsToDownload =
      category === 'all'
        ? allDocuments
        : allDocuments.filter((doc) => doc.category === category);

    if (documentsToDownload.length === 0) {
      this.alertService.info({
        errors: [
          {
            message: 'No documents found for the selected category.',
            errorType: 'info',
          },
        ],
      });
      return;
    }

    // Sequentially download all documents
    documentsToDownload.forEach((doc, index) => {
      setTimeout(() => this.downloadSingleDocument(doc), index * 500); // 500ms delay between downloads
    });

    this.alertService.info({
      errors: [
        {
          message: `Downloading ${documentsToDownload.length} document(s). Check your browser's download manager.`,
          errorType: 'info',
        },
      ],
      timeout: 5000,
    });
  }

  private downloadSingleDocument(doc: IDocument): void {
    if (!doc.id) return;

    const url = `${environment.apiBaseUrl}Property/image/${doc.id}/download`;

    this._http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        if (!blob || blob.size === 0) return;

        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = doc.name || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (err: unknown) => {
        console.error(`Failed to download: ${doc.name}`, err);
        this.alertService.error({
          errors: [
            {
              message: `Failed to download: ${doc.name}. Please try again.`,
              errorType: 'error',
            },
          ],
        });
      },
    });
  }
}
