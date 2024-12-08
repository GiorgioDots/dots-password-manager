import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PasswordSharedService {

  passwordCreated = new BehaviorSubject<void>(undefined);

  setPasswordsChanged(){
    this.passwordCreated.next();
  }
}
