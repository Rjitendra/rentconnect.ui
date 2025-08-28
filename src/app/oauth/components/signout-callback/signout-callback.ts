import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OauthService } from '../../service/oauth.service';

@Component({
  selector: 'app-signout-callback',
  template: `<div></div>`,
})
export class SignoutCallback implements OnInit {
  private authService = inject(OauthService);
  private _router = inject(Router);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.authService.finishLogout().then((_) => {
      this._router.navigate(['/'], { replaceUrl: true });
    });
  }
}
