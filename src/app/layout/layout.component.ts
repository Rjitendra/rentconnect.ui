import { Component, OnInit } from '@angular/core';

import { NAVITEMS } from '../app.nav';
import { LibLayoutComponent, NgAlertComponent } from '../../../projects/shared/src/public-api';
import { OauthService } from '../oauth/service/oauth.service';

@Component({
  selector: 'ng-layout',
  imports: [LibLayoutComponent, NgAlertComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  navItes = NAVITEMS; isLogIn = false;
  constructor(private authService: OauthService) { }

  ngOnInit() {
    this.getAsyncGetUserData();
  }

  onLogIn(): void {
    this.authService.login();
  }
  async onLogout(): Promise<void> {
    try {
      this.authService.logout();
    } catch (err) { }
  }
  loginStatus(): void { }

  async getAsyncGetUserData(): Promise<boolean> {
    try {
      const user = await this.authService.getUser();
      if (user && user.access_token) {
        const res = user.profile['roleName'];
        if (res == 'Landlord') {
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
