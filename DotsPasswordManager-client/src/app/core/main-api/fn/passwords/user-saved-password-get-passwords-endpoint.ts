/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UserSavedPasswordGetPasswordsPasswordResponse } from '../../models/user-saved-password-get-passwords-password-response';

export interface UserSavedPasswordGetPasswordsEndpoint$Params {
}

export function userSavedPasswordGetPasswordsEndpoint(http: HttpClient, rootUrl: string, params?: UserSavedPasswordGetPasswordsEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<UserSavedPasswordGetPasswordsPasswordResponse>>> {
  const rb = new RequestBuilder(rootUrl, userSavedPasswordGetPasswordsEndpoint.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<UserSavedPasswordGetPasswordsPasswordResponse>>;
    })
  );
}

userSavedPasswordGetPasswordsEndpoint.PATH = '/passwords';
