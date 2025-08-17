import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OauthService } from '../../service/oauth.service';

@Component({
  selector: 'app-signout-callback',
  template: `<div></div>`
})
export class SignoutCallback implements OnInit {

  constructor(private authService: OauthService, private _router: Router) { }

  ngOnInit(): void {
    this.authService.finishLogout()
    .then(_ => {
      this._router.navigate(['/'], { replaceUrl: true });
    })
  }
}