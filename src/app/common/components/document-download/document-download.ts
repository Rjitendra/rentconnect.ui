import { Component, input, output } from '@angular/core';

import { NgButton, NgIconComponent } from '../../../../../projects/shared/src/public-api';

@Component({
  selector: 'app-document-download',
  imports: [NgButton, NgIconComponent],
  templateUrl: './document-download.html',
  styleUrl: './document-download.scss',
})
export class DocumentDownload {
  title = input('Document ready');
  description = input('Download the latest generated file for this record.');
  fileName = input('lease-agreement.pdf');
  fileType = input('PDF');
  fileSize = input('1.2 MB');
  disabled = input(false);

  downloadClicked = output<void>();

  onDownload(): void {
    if (!this.disabled()) {
      this.downloadClicked.emit();
    }
  }
}
