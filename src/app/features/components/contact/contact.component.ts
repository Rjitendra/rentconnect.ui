import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ng-contact',
  imports: [RouterModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.registerIcons();
  }
  private registerIcons() {
    this.iconRegistry.addSvgIcon(
      'instagram',
      this.sanitizer.bypassSecurityTrustResourceUrl('icons/instagram.svg'),
    );
    // this.iconRegistry.addSvgIcon(
    //   'linkedin',
    //   this.sanitizer.bypassSecurityTrustResourceUrl('icons/icons/linkedin.svg')
    // );
    // this.iconRegistry.addSvgIcon(
    //   'twitter',
    //   this.sanitizer.bypassSecurityTrustResourceUrl('icons/icons/twitter.svg')
    // );
    // this.iconRegistry.addSvgIcon(
    //   'facebook',
    //   this.sanitizer.bypassSecurityTrustResourceUrl('icons/icons/facebook.svg')
    // );
  }
}
