import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerService } from '../../services/ng-spinner.service';

@Component({
  selector: 'ng-spinner',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './ng-spinner.html',
  styleUrl: './ng-spinner.scss',
})
export class NgSpinner {
  spinnerService = inject(SpinnerService);
}
