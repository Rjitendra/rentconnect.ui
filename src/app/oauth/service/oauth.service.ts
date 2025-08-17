import { Injectable } from '@angular/core';
import * as Oidc from 'oidc-client';
import { User, UserManager, Profile } from 'oidc-client';
import { environment } from '../../../environments/environment';


export interface IUserDetail {
  userId: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  roleId: number;
  roleName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OauthService {
  _userDetail: Partial<IUserDetail> = {};
  userManager: UserManager;

  constructor() {
    const settings = {
      authority: environment.stsBaseUrl,
      client_id: 'rentconnect-angular',
      redirect_uri: `${environment.clientBaseUrl}/signin-callback`,
      automaticSilentRenew: false,
      silent_redirect_uri: `${environment.clientBaseUrl}/assets/silent-callback.html`,
      post_logout_redirect_uri: `${environment.clientBaseUrl}/signout-callback`,
      response_type: 'code',
      scope: 'openid profile email rentconnect-api rentconnect-profile',
      filterProtocolClaims: true,
      loadUserInfo: true,
      // userStore: new Oidc.WebStorageStateStore({
      //   store: window.sessionStorage,
      // }),
    };
    this.userManager = new UserManager(settings);
  }
  public getUser(): Promise<User | null> {
    return this.userManager.getUser();
  }

  public login(): Promise<void> {
    return this.userManager.signinRedirect({ state: window.location.href, prompt: 'login' });
  }

  public renewToken(): Promise<User> {
    return this.userManager.signinSilent();
  }

  public logout(): Promise<void> {
    this._userDetail = {};
    return this.userManager.signoutRedirect();
  }

  public finishLogin = (): Promise<User> => {
    return this.userManager.signinRedirectCallback().then((user) => {
      return user;
    });
  };
  public finishLogout = () => {
    return this.userManager.signoutRedirectCallback();
  };

  setUserInfo(profile: Profile) {
    // this._user = param;
    const profileDetail: IUserDetail = {
      userId: +profile.sub,
      firstName: profile.given_name,
      lastName: profile.family_name,
      fullName: profile.name,
      email: profile.email,
      roleId: profile['roleId'],
      roleName: profile['roleName'],
    };
    this._userDetail = profileDetail;
  }

  getUserInfo() {
    return this._userDetail;
  }
}
