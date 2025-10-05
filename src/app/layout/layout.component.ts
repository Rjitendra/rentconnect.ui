import { Component, inject, OnInit } from '@angular/core';

import {
  LibLayoutComponent,
  NgAlertComponent,
} from '../../../projects/shared/src/public-api';
import { NAVITEMS } from '../app.nav';
import { OauthService } from '../oauth/service/oauth.service';

@Component({
  selector: 'app-layout',
  imports: [LibLayoutComponent, NgAlertComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  navItems = NAVITEMS;
  isLogIn = false;

  private authService = inject(OauthService);

  ngOnInit() {
    this.getAsyncGetUserData();
  }

  onLogIn(): void {
    this.authService.login();
  }

  async onLogout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (err) {}
  }
  loginStatus(): void {}

  async getAsyncGetUserData(): Promise<boolean> {
    try {
      const user = await this.authService.getUser();
      if (user && user.access_token) {
        const res = user.profile['roleName'];
        if (res === 'Landlord' || res === 'Tenant') {
          this.navItems = res === 'Tenant' ? [] : NAVITEMS;
          this.authService.setUserInfo(user.profile);
          this.isLogIn = true;
          return true;
        } else {
          // this.router.navigate(['/']);
          this.isLogIn = false;
          return false;
        }
      } else {
        this.isLogIn = false;
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}
