/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UserSavedPasswordDeletePasswordDeletePasswordResponse } from '../../models/user-saved-password-delete-password-delete-password-response';

export interface UserSavedPasswordDeletePasswordEndpoint$Params {
  Id: string;
}

export function userSavedPasswordDeletePasswordEndpoint(http: HttpClient, rootUrl: string, params: UserSavedPasswordDeletePasswordEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserSavedPasswordDeletePasswordDeletePasswordResponse>> {
  const rb = new RequestBuilder(rootUrl, userSavedPasswordDeletePasswordEndpoint.PATH, 'delete');
  if (params) {
    rb.path('Id', params.Id, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<UserSavedPasswordDeletePasswordDeletePasswordResponse>;
    })
  );
}

userSavedPasswordDeletePasswordEndpoint.PATH = '/passwords/{Id}';