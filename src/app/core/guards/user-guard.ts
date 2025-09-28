import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { forkJoin, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { CommonService } from '../../features/service/common.service';
import { OauthService } from '../../oauth/service/oauth.service';

export const userGuard: CanActivateFn = async () => {
  const authService = inject(OauthService);

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

export const landlordGuard: CanActivateFn = () => {
  const authService = inject(OauthService);
  const commonService = inject(CommonService);
  const router = inject(Router);

  return from(authService.getUser()).pipe(
    switchMap((user) => {
      if (!user || !user.access_token) {
        router.navigate(['/']);
        return of(false);
      }

      const roleName = user.profile['roleName'];

      if (roleName === 'Landlord') {
        // Set user info first
        authService.setUserInfo(user.profile);

        // Get userId for landlord details
        const userId = authService.getUserInfo().userId;

        if (userId !== undefined) {
          // Use forkJoin to handle both operations
          return forkJoin({
            userSet: of(true), // User info already set
            landlordDetails: commonService.setLandlordDetails(userId).pipe(
              map(() => true), // Convert successful response to true
              catchError((error) => {
                console.error(
                  'Failed to set landlord details in guard:',
                  error,
                );
                return of(false); // Continue even if landlord details fail
              }),
            ),
          }).pipe(
            map(() => true), // Return true when both operations complete
            catchError(() => of(true)), // Still allow access even if landlord details fail
          );
        }

        return of(true); // Allow access even without userId
      }

      // If not landlord, redirect to appropriate dashboard
      if (roleName === 'Tenant') {
        router.navigate(['/tenant']);
      } else {
        router.navigate(['/']);
      }
      return of(false);
    }),
    catchError((error) => {
      console.error('Error in landlord guard:', error);
      router.navigate(['/']);
      return of(false);
    }),
  );
};

export const tenantGuard: CanActivateFn = async () => {
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
