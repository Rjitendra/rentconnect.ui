import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { OauthService } from "../../oauth/service/oauth.service";


export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(OauthService);
  const router = inject(Router);

  try {
    const user = await authService.getUser();

    if (user && user.access_token) {
      const role = user.profile['roleName'];
      authService.setUserInfo(user.profile);

      if (role === 'Landlord') {
        router.navigate(['landlord']);
        return false;
      }

      if (role === 'Tenant') {
        router.navigate(['user']);
        return false;
      }

      // If role exists but is neither Landlord nor Tenant
      return true;
    } else {
      return true;
    }
  } catch (error) {
    // In case of any error, redirect to login
    router.navigate(['/login']);
    return false;
  }
};
