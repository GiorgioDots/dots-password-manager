/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { userSavedPasswordCreatePasswordEndpoint } from '../fn/passwords/user-saved-password-create-password-endpoint';
import { UserSavedPasswordCreatePasswordEndpoint$Params } from '../fn/passwords/user-saved-password-create-password-endpoint';
import { UserSavedPasswordCreatePasswordResponse } from '../models/user-saved-password-create-password-response';
import { userSavedPasswordGetPasswordsEndpoint } from '../fn/passwords/user-saved-password-get-passwords-endpoint';
import { UserSavedPasswordGetPasswordsEndpoint$Params } from '../fn/passwords/user-saved-password-get-passwords-endpoint';
import { UserSavedPasswordGetPasswordsPasswordResponse } from '../models/user-saved-password-get-passwords-password-response';

@Injectable({ providedIn: 'root' })
export class PasswordsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `userSavedPasswordGetPasswordsEndpoint()` */
  static readonly UserSavedPasswordGetPasswordsEndpointPath = '/passwords';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userSavedPasswordGetPasswordsEndpoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  userSavedPasswordGetPasswordsEndpoint$Response(params?: UserSavedPasswordGetPasswordsEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<UserSavedPasswordGetPasswordsPasswordResponse>>> {
    return userSavedPasswordGetPasswordsEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userSavedPasswordGetPasswordsEndpoint$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  userSavedPasswordGetPasswordsEndpoint(params?: UserSavedPasswordGetPasswordsEndpoint$Params, context?: HttpContext): Observable<Array<UserSavedPasswordGetPasswordsPasswordResponse>> {
    return this.userSavedPasswordGetPasswordsEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<UserSavedPasswordGetPasswordsPasswordResponse>>): Array<UserSavedPasswordGetPasswordsPasswordResponse> => r.body)
    );
  }

  /** Path part for operation `userSavedPasswordCreatePasswordEndpoint()` */
  static readonly UserSavedPasswordCreatePasswordEndpointPath = '/passwords/create';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userSavedPasswordCreatePasswordEndpoint()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userSavedPasswordCreatePasswordEndpoint$Response(params: UserSavedPasswordCreatePasswordEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserSavedPasswordCreatePasswordResponse>> {
    return userSavedPasswordCreatePasswordEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userSavedPasswordCreatePasswordEndpoint$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userSavedPasswordCreatePasswordEndpoint(params: UserSavedPasswordCreatePasswordEndpoint$Params, context?: HttpContext): Observable<UserSavedPasswordCreatePasswordResponse> {
    return this.userSavedPasswordCreatePasswordEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserSavedPasswordCreatePasswordResponse>): UserSavedPasswordCreatePasswordResponse => r.body)
    );
  }

}
