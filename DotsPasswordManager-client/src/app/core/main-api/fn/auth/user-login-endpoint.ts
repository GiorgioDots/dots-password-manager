/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UserLoginRequest } from '../../models/user-login-request';
import { UserLoginResponse } from '../../models/user-login-response';

export interface UserLoginEndpoint$Params {
      body: UserLoginRequest
}

export function userLoginEndpoint(http: HttpClient, rootUrl: string, params: UserLoginEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserLoginResponse>> {
  const rb = new RequestBuilder(rootUrl, userLoginEndpoint.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<UserLoginResponse>;
    })
  );
}

userLoginEndpoint.PATH = '/auth/login';
