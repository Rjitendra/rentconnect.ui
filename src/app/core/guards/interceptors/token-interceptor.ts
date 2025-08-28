import {
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { User } from 'oidc-client';
import { Observable, from, switchMap } from 'rxjs';
import { OauthService } from '../../../oauth/service/oauth.service';

export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const oauthService = inject(OauthService);

  return from(getCurrentUserValue()).pipe(
    switchMap((token: User) => {
      // Set Authorization header
      let headers = req.headers.set(
        'Authorization',
        'Bearer ' + token.access_token,
      );

      // Only set content-type if body is NOT FormData
      if (!(req.body instanceof FormData)) {
        headers = headers.set('Content-Type', 'application/json');
      }

      // Clone request with headers
      const requestClone = req.clone({ headers });

      // Pass cloned request to next handler
      return next(requestClone);
    }),
  );

  async function getCurrentUserValue(): Promise<User> {
    try {
      let user: User | null = await oauthService.getUser();

      if (user && user.access_token && !user.expired) {
        oauthService.setUserInfo(user.profile);
        return user;
      }

      if (user && user.access_token && user.expired) {
        user = await oauthService.renewToken();
        oauthService.setUserInfo(user.profile);
        return user;
      }

      await oauthService.login();
      throw new Error('Redirecting to login');
    } catch (error) {
      await oauthService.login();
      throw new Error('Redirecting to login');
    }
  }
};
