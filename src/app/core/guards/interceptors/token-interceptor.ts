import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { User } from 'oidc-client';
import { Observable, from } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import { SpinnerService } from '../../../../../projects/shared/src/public-api';
import { OauthService } from '../../../oauth/service/oauth.service';

export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const oauthService = inject(OauthService);
  const spinnerService = inject(SpinnerService);

  // Skip global spinner for chatbot requests (chatbot has its own loading indicator)
  const isChatbotRequest =
    req.url.includes('/Chatbot/') || req.headers.has('X-Skip-Spinner');

  if (!isChatbotRequest) {
    spinnerService.show(); // 🔥 show spinner on request start
  }

  return from(getCurrentUserValue()).pipe(
    switchMap((token: User) => {
      let headers = req.headers.set(
        'Authorization',
        'Bearer ' + token.access_token,
      );

      if (!(req.body instanceof FormData)) {
        headers = headers.set('Content-Type', 'application/json');
      }

      const requestClone = req.clone({ headers });
      return next(requestClone).pipe(
        finalize(() => {
          // Only hide spinner if it was shown for this request
          if (!isChatbotRequest) {
            spinnerService.hide(); // 🔥 always hide when request finishes
          }
        }),
      );
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
