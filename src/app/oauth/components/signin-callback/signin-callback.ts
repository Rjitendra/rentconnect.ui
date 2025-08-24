import { Component, OnInit, inject } from '@angular/core';
import { OauthService } from '../../service/oauth.service';

@Component({
  selector: 'app-signin-callback',
  imports: [],
 template: `<div></div>`,
})
export class SigninCallback implements OnInit {
  private authService = inject(OauthService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.authService.finishLogin().then((x) => {
      window.location = x.state || '/';
    });
  }
}
