/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UserAuthLoginRequest } from '../../models/user-auth-login-request';
import { UserAuthLoginResponse } from '../../models/user-auth-login-response';

export interface UserAuthLoginEndpoint$Params {
      body: UserAuthLoginRequest
}

export function userAuthLoginEndpoint(http: HttpClient, rootUrl: string, params: UserAuthLoginEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserAuthLoginResponse>> {
  const rb = new RequestBuilder(rootUrl, userAuthLoginEndpoint.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<UserAuthLoginResponse>;
    })
  );
}

userAuthLoginEndpoint.PATH = '/api/auth/login';
