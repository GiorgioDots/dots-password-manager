/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UserSavedPasswordCreatePasswordRequest } from '../../models/user-saved-password-create-password-request';
import { UserSavedPasswordCreatePasswordResponse } from '../../models/user-saved-password-create-password-response';

export interface UserSavedPasswordCreatePasswordEndpoint$Params {
      body: UserSavedPasswordCreatePasswordRequest
}

export function userSavedPasswordCreatePasswordEndpoint(http: HttpClient, rootUrl: string, params: UserSavedPasswordCreatePasswordEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserSavedPasswordCreatePasswordResponse>> {
  const rb = new RequestBuilder(rootUrl, userSavedPasswordCreatePasswordEndpoint.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<UserSavedPasswordCreatePasswordResponse>;
    })
  );
}

userSavedPasswordCreatePasswordEndpoint.PATH = '/passwords/create';