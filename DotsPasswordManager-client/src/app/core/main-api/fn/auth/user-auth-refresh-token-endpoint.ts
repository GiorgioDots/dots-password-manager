/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UserAuthRefreshTokenRequest } from '../../models/user-auth-refresh-token-request';
import { UserAuthRefreshTokenResponse } from '../../models/user-auth-refresh-token-response';

export interface UserAuthRefreshTokenEndpoint$Params {
  body: UserAuthRefreshTokenRequest;
}

export function userAuthRefreshTokenEndpoint(
  http: HttpClient,
  rootUrl: string,
  params: UserAuthRefreshTokenEndpoint$Params,
  context?: HttpContext
): Observable<StrictHttpResponse<UserAuthRefreshTokenResponse>> {
  const rb = new RequestBuilder(
    rootUrl,
    userAuthRefreshTokenEndpoint.PATH,
    'post'
  );
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http
    .request(
      rb.build({ responseType: 'json', accept: 'application/json', context })
    )
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<UserAuthRefreshTokenResponse>;
      })
    );
}

userAuthRefreshTokenEndpoint.PATH = '/auth/refresh-token';
