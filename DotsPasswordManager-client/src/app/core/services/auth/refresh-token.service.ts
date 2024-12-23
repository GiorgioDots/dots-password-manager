import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RefreshTokenService {
  public isRefreshing = false;
  public refreshTokenSubject = new BehaviorSubject<string | undefined>(
    undefined
  );

  constructor() {}
}
