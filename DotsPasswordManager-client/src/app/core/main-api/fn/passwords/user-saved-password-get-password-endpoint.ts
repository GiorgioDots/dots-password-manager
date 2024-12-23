/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UserSavedPasswordDtOsSavedPasswordDto } from '../../models/user-saved-password-dt-os-saved-password-dto';

export interface UserSavedPasswordGetPasswordEndpoint$Params {
  Id: string;
}

export function userSavedPasswordGetPasswordEndpoint(
  http: HttpClient,
  rootUrl: string,
  params: UserSavedPasswordGetPasswordEndpoint$Params,
  context?: HttpContext
): Observable<StrictHttpResponse<UserSavedPasswordDtOsSavedPasswordDto>> {
  const rb = new RequestBuilder(
    rootUrl,
    userSavedPasswordGetPasswordEndpoint.PATH,
    'get'
  );
  if (params) {
    rb.path('Id', params.Id, {});
  }

  return http
    .request(
      rb.build({ responseType: 'json', accept: 'application/json', context })
    )
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<UserSavedPasswordDtOsSavedPasswordDto>;
      })
    );
}

userSavedPasswordGetPasswordEndpoint.PATH = '/passwords/{Id}';
