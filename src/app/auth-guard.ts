import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OauthService } from './oauth/service/oauth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(OauthService);
  const router = inject(Router);

  const user = await authService.getUser();

  if (user && user.access_token) {
    const role = user.profile['roleName'];

    if (role === 'Landlord') {
      router.navigate(['landlord']);
      return false;
    }
    if (role === 'Tenant') {
      router.navigate(['user']);
      return false;
    }
    return true;
  } else {
    return true;
  }
};
