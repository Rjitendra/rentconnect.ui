import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { OauthService } from '../../oauth/service/oauth.service';

export const userGuard: CanActivateFn = async (route, state) => {
  const authService = inject(OauthService);
  const router = inject(Router);

  try {
    const user = await authService.getUser();
    if (user && user.access_token) {
      const res = user.profile['roleName'];
      if (res === 'Landlord' || res === 'Tenant') {
        authService.setUserInfo(user.profile);
        return true;
      }

      return false;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const landlordGuard: CanActivateFn = async (route, state) => {
  const authService = inject(OauthService);
  const router = inject(Router);

  try {
    const user = await authService.getUser();
    if (user && user.access_token) {
      const res = user.profile['roleName'];
      if (res === 'Landlord') {
        authService.setUserInfo(user.profile);
        return true;
      }

      // If not landlord, redirect to appropriate dashboard
      if (res === 'Tenant') {
        router.navigate(['/tenant']);
      } else {
        router.navigate(['/']);
      }
      return false;
    } else {
      router.navigate(['/']);
      return false;
    }
  } catch (error) {
    router.navigate(['/']);
    return false;
  }
};

export const tenantGuard: CanActivateFn = async (route, state) => {
  const authService = inject(OauthService);
  const router = inject(Router);

  try {
    const user = await authService.getUser();
    if (user && user.access_token) {
      const res = user.profile['roleName'];
      if (res === 'Tenant') {
        authService.setUserInfo(user.profile);
        return true;
      }

      // If not tenant, redirect to appropriate dashboard
      if (res === 'Landlord') {
        router.navigate(['/landlord']);
      } else {
        router.navigate(['/']);
      }
      return false;
    } else {
      router.navigate(['/']);
      return false;
    }
  } catch (error) {
    router.navigate(['/']);
    return false;
  }
};
