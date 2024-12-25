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

import { userAuthLoginEndpoint } from '../fn/api/user-auth-login-endpoint';
import { UserAuthLoginEndpoint$Params } from '../fn/api/user-auth-login-endpoint';
import { UserAuthLoginResponse } from '../models/user-auth-login-response';
import { userAuthRefreshTokenEndpoint } from '../fn/api/user-auth-refresh-token-endpoint';
import { UserAuthRefreshTokenEndpoint$Params } from '../fn/api/user-auth-refresh-token-endpoint';
import { UserAuthRefreshTokenResponse } from '../models/user-auth-refresh-token-response';
import { userAuthRegisterEndpoint } from '../fn/api/user-auth-register-endpoint';
import { UserAuthRegisterEndpoint$Params } from '../fn/api/user-auth-register-endpoint';
import { UserAuthRegisterResponse } from '../models/user-auth-register-response';
import { userAuthResetPasswordEndpoint } from '../fn/api/user-auth-reset-password-endpoint';
import { UserAuthResetPasswordEndpoint$Params } from '../fn/api/user-auth-reset-password-endpoint';
import { userAuthResetPasswordRequestEndpoint } from '../fn/api/user-auth-reset-password-request-endpoint';
import { UserAuthResetPasswordRequestEndpoint$Params } from '../fn/api/user-auth-reset-password-request-endpoint';
import { UserAuthResetPasswordRequestResponse } from '../models/user-auth-reset-password-request-response';
import { UserAuthResetPasswordResponse } from '../models/user-auth-reset-password-response';
import { UserSavedPasswordDtOsImportExportDto } from '../models/user-saved-password-dt-os-import-export-dto';
import { UserSavedPasswordDtOsSavedPasswordDto } from '../models/user-saved-password-dt-os-saved-password-dto';
import { userSavedPasswordCreatePasswordEndpoint } from '../fn/api/user-saved-password-create-password-endpoint';
import { UserSavedPasswordCreatePasswordEndpoint$Params } from '../fn/api/user-saved-password-create-password-endpoint';
import { UserSavedPasswordDeletePasswordDeletePasswordResponse } from '../models/user-saved-password-delete-password-delete-password-response';
import { userSavedPasswordDeletePasswordEndpoint } from '../fn/api/user-saved-password-delete-password-endpoint';
import { UserSavedPasswordDeletePasswordEndpoint$Params } from '../fn/api/user-saved-password-delete-password-endpoint';
import { userSavedPasswordExportEndpoint } from '../fn/api/user-saved-password-export-endpoint';
import { UserSavedPasswordExportEndpoint$Params } from '../fn/api/user-saved-password-export-endpoint';
import { userSavedPasswordGetPasswordEndpoint } from '../fn/api/user-saved-password-get-password-endpoint';
import { UserSavedPasswordGetPasswordEndpoint$Params } from '../fn/api/user-saved-password-get-password-endpoint';
import { userSavedPasswordGetPasswordsEndpoint } from '../fn/api/user-saved-password-get-passwords-endpoint';
import { UserSavedPasswordGetPasswordsEndpoint$Params } from '../fn/api/user-saved-password-get-passwords-endpoint';
import { userSavedPasswordImportEndpoint } from '../fn/api/user-saved-password-import-endpoint';
import { UserSavedPasswordImportEndpoint$Params } from '../fn/api/user-saved-password-import-endpoint';
import { UserSavedPasswordImportResponse } from '../models/user-saved-password-import-response';
import { userSavedPasswordToggleFavouriteEndpoint } from '../fn/api/user-saved-password-toggle-favourite-endpoint';
import { UserSavedPasswordToggleFavouriteEndpoint$Params } from '../fn/api/user-saved-password-toggle-favourite-endpoint';
import { userSavedPasswordUpdatePasswordEndpoint } from '../fn/api/user-saved-password-update-password-endpoint';
import { UserSavedPasswordUpdatePasswordEndpoint$Params } from '../fn/api/user-saved-password-update-password-endpoint';

@Injectable({ providedIn: 'root' })
export class ApiService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `userSavedPasswordUpdatePasswordEndpoint()` */
  static readonly UserSavedPasswordUpdatePasswordEndpointPath = '/api/passwords/edit';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userSavedPasswordUpdatePasswordEndpoint()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userSavedPasswordUpdatePasswordEndpoint$Response(params: UserSavedPasswordUpdatePasswordEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserSavedPasswordDtOsSavedPasswordDto>> {
    return userSavedPasswordUpdatePasswordEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userSavedPasswordUpdatePasswordEndpoint$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userSavedPasswordUpdatePasswordEndpoint(params: UserSavedPasswordUpdatePasswordEndpoint$Params, context?: HttpContext): Observable<UserSavedPasswordDtOsSavedPasswordDto> {
    return this.userSavedPasswordUpdatePasswordEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserSavedPasswordDtOsSavedPasswordDto>): UserSavedPasswordDtOsSavedPasswordDto => r.body)
    );
  }

  /** Path part for operation `userSavedPasswordToggleFavouriteEndpoint()` */
  static readonly UserSavedPasswordToggleFavouriteEndpointPath = '/api/passwords/{Id}/toggle-favourite';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userSavedPasswordToggleFavouriteEndpoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  userSavedPasswordToggleFavouriteEndpoint$Response(params: UserSavedPasswordToggleFavouriteEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserSavedPasswordDtOsSavedPasswordDto>> {
    return userSavedPasswordToggleFavouriteEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userSavedPasswordToggleFavouriteEndpoint$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  userSavedPasswordToggleFavouriteEndpoint(params: UserSavedPasswordToggleFavouriteEndpoint$Params, context?: HttpContext): Observable<UserSavedPasswordDtOsSavedPasswordDto> {
    return this.userSavedPasswordToggleFavouriteEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserSavedPasswordDtOsSavedPasswordDto>): UserSavedPasswordDtOsSavedPasswordDto => r.body)
    );
  }

  /** Path part for operation `userSavedPasswordImportEndpoint()` */
  static readonly UserSavedPasswordImportEndpointPath = '/api/passwords/import';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userSavedPasswordImportEndpoint()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userSavedPasswordImportEndpoint$Response(params: UserSavedPasswordImportEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserSavedPasswordImportResponse>> {
    return userSavedPasswordImportEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userSavedPasswordImportEndpoint$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userSavedPasswordImportEndpoint(params: UserSavedPasswordImportEndpoint$Params, context?: HttpContext): Observable<UserSavedPasswordImportResponse> {
    return this.userSavedPasswordImportEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserSavedPasswordImportResponse>): UserSavedPasswordImportResponse => r.body)
    );
  }

  /** Path part for operation `userSavedPasswordGetPasswordEndpoint()` */
  static readonly UserSavedPasswordGetPasswordEndpointPath = '/api/passwords/{Id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userSavedPasswordGetPasswordEndpoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  userSavedPasswordGetPasswordEndpoint$Response(params: UserSavedPasswordGetPasswordEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserSavedPasswordDtOsSavedPasswordDto>> {
    return userSavedPasswordGetPasswordEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userSavedPasswordGetPasswordEndpoint$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  userSavedPasswordGetPasswordEndpoint(params: UserSavedPasswordGetPasswordEndpoint$Params, context?: HttpContext): Observable<UserSavedPasswordDtOsSavedPasswordDto> {
    return this.userSavedPasswordGetPasswordEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserSavedPasswordDtOsSavedPasswordDto>): UserSavedPasswordDtOsSavedPasswordDto => r.body)
    );
  }

  /** Path part for operation `userSavedPasswordDeletePasswordEndpoint()` */
  static readonly UserSavedPasswordDeletePasswordEndpointPath = '/api/passwords/{Id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userSavedPasswordDeletePasswordEndpoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  userSavedPasswordDeletePasswordEndpoint$Response(params: UserSavedPasswordDeletePasswordEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserSavedPasswordDeletePasswordDeletePasswordResponse>> {
    return userSavedPasswordDeletePasswordEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userSavedPasswordDeletePasswordEndpoint$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  userSavedPasswordDeletePasswordEndpoint(params: UserSavedPasswordDeletePasswordEndpoint$Params, context?: HttpContext): Observable<UserSavedPasswordDeletePasswordDeletePasswordResponse> {
    return this.userSavedPasswordDeletePasswordEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserSavedPasswordDeletePasswordDeletePasswordResponse>): UserSavedPasswordDeletePasswordDeletePasswordResponse => r.body)
    );
  }

  /** Path part for operation `userSavedPasswordGetPasswordsEndpoint()` */
  static readonly UserSavedPasswordGetPasswordsEndpointPath = '/api/passwords';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userSavedPasswordGetPasswordsEndpoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  userSavedPasswordGetPasswordsEndpoint$Response(params?: UserSavedPasswordGetPasswordsEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<UserSavedPasswordDtOsSavedPasswordDto>>> {
    return userSavedPasswordGetPasswordsEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userSavedPasswordGetPasswordsEndpoint$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  userSavedPasswordGetPasswordsEndpoint(params?: UserSavedPasswordGetPasswordsEndpoint$Params, context?: HttpContext): Observable<Array<UserSavedPasswordDtOsSavedPasswordDto>> {
    return this.userSavedPasswordGetPasswordsEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<UserSavedPasswordDtOsSavedPasswordDto>>): Array<UserSavedPasswordDtOsSavedPasswordDto> => r.body)
    );
  }

  /** Path part for operation `userSavedPasswordExportEndpoint()` */
  static readonly UserSavedPasswordExportEndpointPath = '/api/passwords/export';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userSavedPasswordExportEndpoint()` instead.
   *
   * This method doesn't expect any request body.
   */
  userSavedPasswordExportEndpoint$Response(params?: UserSavedPasswordExportEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserSavedPasswordDtOsImportExportDto>> {
    return userSavedPasswordExportEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userSavedPasswordExportEndpoint$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  userSavedPasswordExportEndpoint(params?: UserSavedPasswordExportEndpoint$Params, context?: HttpContext): Observable<UserSavedPasswordDtOsImportExportDto> {
    return this.userSavedPasswordExportEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserSavedPasswordDtOsImportExportDto>): UserSavedPasswordDtOsImportExportDto => r.body)
    );
  }

  /** Path part for operation `userSavedPasswordCreatePasswordEndpoint()` */
  static readonly UserSavedPasswordCreatePasswordEndpointPath = '/api/passwords/create';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userSavedPasswordCreatePasswordEndpoint()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userSavedPasswordCreatePasswordEndpoint$Response(params: UserSavedPasswordCreatePasswordEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserSavedPasswordDtOsSavedPasswordDto>> {
    return userSavedPasswordCreatePasswordEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userSavedPasswordCreatePasswordEndpoint$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userSavedPasswordCreatePasswordEndpoint(params: UserSavedPasswordCreatePasswordEndpoint$Params, context?: HttpContext): Observable<UserSavedPasswordDtOsSavedPasswordDto> {
    return this.userSavedPasswordCreatePasswordEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserSavedPasswordDtOsSavedPasswordDto>): UserSavedPasswordDtOsSavedPasswordDto => r.body)
    );
  }

  /** Path part for operation `userAuthResetPasswordEndpoint()` */
  static readonly UserAuthResetPasswordEndpointPath = '/api/auth/reset-password';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userAuthResetPasswordEndpoint()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userAuthResetPasswordEndpoint$Response(params: UserAuthResetPasswordEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserAuthResetPasswordResponse>> {
    return userAuthResetPasswordEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userAuthResetPasswordEndpoint$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userAuthResetPasswordEndpoint(params: UserAuthResetPasswordEndpoint$Params, context?: HttpContext): Observable<UserAuthResetPasswordResponse> {
    return this.userAuthResetPasswordEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserAuthResetPasswordResponse>): UserAuthResetPasswordResponse => r.body)
    );
  }

  /** Path part for operation `userAuthResetPasswordRequestEndpoint()` */
  static readonly UserAuthResetPasswordRequestEndpointPath = '/api/auth/reset-password-request';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userAuthResetPasswordRequestEndpoint()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userAuthResetPasswordRequestEndpoint$Response(params: UserAuthResetPasswordRequestEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserAuthResetPasswordRequestResponse>> {
    return userAuthResetPasswordRequestEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userAuthResetPasswordRequestEndpoint$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userAuthResetPasswordRequestEndpoint(params: UserAuthResetPasswordRequestEndpoint$Params, context?: HttpContext): Observable<UserAuthResetPasswordRequestResponse> {
    return this.userAuthResetPasswordRequestEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserAuthResetPasswordRequestResponse>): UserAuthResetPasswordRequestResponse => r.body)
    );
  }

  /** Path part for operation `userAuthRegisterEndpoint()` */
  static readonly UserAuthRegisterEndpointPath = '/api/auth/register';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userAuthRegisterEndpoint()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userAuthRegisterEndpoint$Response(params: UserAuthRegisterEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserAuthRegisterResponse>> {
    return userAuthRegisterEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userAuthRegisterEndpoint$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userAuthRegisterEndpoint(params: UserAuthRegisterEndpoint$Params, context?: HttpContext): Observable<UserAuthRegisterResponse> {
    return this.userAuthRegisterEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserAuthRegisterResponse>): UserAuthRegisterResponse => r.body)
    );
  }

  /** Path part for operation `userAuthRefreshTokenEndpoint()` */
  static readonly UserAuthRefreshTokenEndpointPath = '/api/auth/refresh-token';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userAuthRefreshTokenEndpoint()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userAuthRefreshTokenEndpoint$Response(params: UserAuthRefreshTokenEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserAuthRefreshTokenResponse>> {
    return userAuthRefreshTokenEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userAuthRefreshTokenEndpoint$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userAuthRefreshTokenEndpoint(params: UserAuthRefreshTokenEndpoint$Params, context?: HttpContext): Observable<UserAuthRefreshTokenResponse> {
    return this.userAuthRefreshTokenEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserAuthRefreshTokenResponse>): UserAuthRefreshTokenResponse => r.body)
    );
  }

  /** Path part for operation `userAuthLoginEndpoint()` */
  static readonly UserAuthLoginEndpointPath = '/api/auth/login';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `userAuthLoginEndpoint()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userAuthLoginEndpoint$Response(params: UserAuthLoginEndpoint$Params, context?: HttpContext): Observable<StrictHttpResponse<UserAuthLoginResponse>> {
    return userAuthLoginEndpoint(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `userAuthLoginEndpoint$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  userAuthLoginEndpoint(params: UserAuthLoginEndpoint$Params, context?: HttpContext): Observable<UserAuthLoginResponse> {
    return this.userAuthLoginEndpoint$Response(params, context).pipe(
      map((r: StrictHttpResponse<UserAuthLoginResponse>): UserAuthLoginResponse => r.body)
    );
  }

}
