import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { OauthService } from '../../oauth/service/oauth.service';

export const userGuard: CanActivateFn = async (route, state) => {
  const authService = inject(OauthService);
  const router = inject(Router);

  try {
    const user = await authService.getUser();
    if (user && user.access_token) {
      var res = user.profile['roleName'];
      if (res == 'Landlord') {
         authService.setUserInfo(user.profile);
        return true
      }

      return false;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
