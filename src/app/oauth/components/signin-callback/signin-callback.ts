import { Component, OnInit } from '@angular/core';
import { OauthService } from '../../service/oauth.service';

@Component({
  selector: 'app-signin-callback',
  imports: [],
 template: `<div></div>`,
})
export class SigninCallback implements OnInit {
  constructor(private authService: OauthService) {}

  ngOnInit(): void {
    this.authService.finishLogin().then((x) => {
      window.location = x.state || '/';
    });
  }
}
