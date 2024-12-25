/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UserAuthResetPasswordRequest } from '../../models/user-auth-reset-password-request';
import { UserAuthResetPasswordResponse } from '../../models/user-auth-reset-password-response';

export interface UserAuthResetPasswordEndpoint$Params {
      body: UserAuthResetPasswordRequest
}

export function userAuthResetPasswordEndpoint(http: HttpClient, rootUrl: string, params: UserAuthResetPasswordEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserAuthResetPasswordResponse>> {
  const rb = new RequestBuilder(rootUrl, userAuthResetPasswordEndpoint.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<UserAuthResetPasswordResponse>;
    })
  );
}

userAuthResetPasswordEndpoint.PATH = '/api/auth/reset-password';
