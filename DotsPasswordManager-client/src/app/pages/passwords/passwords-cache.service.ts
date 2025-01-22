import { UserSavedPasswordDtOsSavedPasswordDto } from '@/app/core/main-api/models';
import { ApiService } from '@/app/core/main-api/services';
import { ClientCryptoService } from '@/app/core/services/e2e-encryption/client-crypto.service';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, from, of, switchMap, tap, throwError } from 'rxjs';
import { filter, sortBy } from 'underscore';

@Injectable({
  providedIn: 'root',
})
export class PasswordsCacheService {
  private passwordsApi = inject(ApiService);
  private clientCrypto = inject(ClientCryptoService);

  private _filter = signal<string>('');
  private _passwords = signal<LoadableSavedPassword[]>([]);

  public loadingAll = signal(false);

  public sorted = computed(() => {
    const sorted = sortBy(this._passwords(), k =>
      k.IsFavourite ? 1 + k.Name?.toLowerCase() : 2 + k.Name?.toLowerCase()
    );
    return sorted;
  });
  public filteredPasswords = computed(() => {
    return filter(this.sorted(), k => {
      let filter = this._filter() ?? '';
      if (filter == '') return true;
      return k.Name.toLowerCase().includes(filter.toLowerCase());
    });
  });
  public favourites = computed(() =>
    this.filteredPasswords().filter(k => k.IsFavourite)
  );
  public notFavourites = computed(() => {
    return this.filteredPasswords().filter(k => !k.IsFavourite);
  });

  getAll(force = false) {
    if (!force && this._passwords().length > 0) return of();
    if(!force){
      this.loadingAll.set(true);
    }
    return this.passwordsApi.userSavedPasswordGetPasswordsEndpoint().pipe(
      // switchMap(res => {
      //   const promises = res.map(async k => this.decryptPwd(k));
      //   return from(Promise.all(promises));
      // }),
      tap(res => {
        console.log(res);
        this.loadingAll.set(false);
        this._passwords.set(res.map(k => ({ ...k, isLoaded: false })));
      }),
      catchError(err => {
        this.loadingAll.set(false);
        return throwError(() => err);
      })
    );
  }

  get(id: string, forceRefresh: boolean = false) {
    if (forceRefresh) {
      return this._get(id);
    }
    const cached = this._passwords().find(k => k.PasswordId == id);
    if (!cached || !cached.isLoaded) {
      return this._get(id);
    } else {
      return of(cached);
    }
  }

  private _get(id: string) {
    return this.passwordsApi
      .userSavedPasswordGetPasswordEndpoint({
        Id: id,
      })
      .pipe(
        switchMap(res => {
          return from(this.decryptPwd(res));
        }),
        tap(pwd => {
          this._passwords.update(k => {
            const tmp = k.filter(p => p.PasswordId != pwd.PasswordId);
            tmp.push({ ...pwd, isLoaded: true });
            return tmp;
          });
        })
      );
  }

  create(data: UserSavedPasswordDtOsSavedPasswordDto) {
    return this.passwordsApi
      .userSavedPasswordCreatePasswordEndpoint({
        body: data,
      })
      .pipe(
        switchMap(ret => {
          return from(this.decryptPwd(ret));
        }),
        tap(pwd => {
          this._passwords.update(k => [{ ...pwd, isLoaded: true }, ...k]);
        })
      );
  }

  update(data: UserSavedPasswordDtOsSavedPasswordDto) {
    return this.passwordsApi
      .userSavedPasswordUpdatePasswordEndpoint({
        body: data,
      })
      .pipe(
        switchMap(ret => {
          return from(this.decryptPwd(ret));
        }),
        tap(pwd => {
          this._passwords.update(k => {
            const tmp = k.filter(p => p.PasswordId != pwd.PasswordId);
            tmp.push({ ...pwd, isLoaded: true });
            return tmp;
          });
        })
      );
  }

  delete(id: string) {
    return this.passwordsApi
      .userSavedPasswordDeletePasswordEndpoint({
        Id: id,
      })
      .pipe(
        tap(() => {
          this._passwords.update(pwds => pwds.filter(k => k.PasswordId != id));
        })
      );
  }

  toggleFavourite(password: UserSavedPasswordDtOsSavedPasswordDto) {
    return this.passwordsApi
      .userSavedPasswordToggleFavouriteEndpoint({
        Id: password.PasswordId!,
      })
      .pipe(
        tap(res => {
          const pwd = this._passwords().find(
            k => k.PasswordId == res.PasswordId
          );
          if (pwd) pwd.IsFavourite = res.IsFavourite;
          this._passwords.set([...this._passwords()]);
        })
      );
  }

  setFilter(k: string | null) {
    this._filter.set(k ?? '');
  }

  clear() {
    this._passwords.set([]);
    this._filter.set('');
  }

  private async decryptPwd(pwd: UserSavedPasswordDtOsSavedPasswordDto) {
    pwd.Login = await this.clientCrypto.decryptDataAsync(pwd.Login!);
    pwd.Password = await this.clientCrypto.decryptDataAsync(pwd.Password!);
    if (pwd.SecondLogin) {
      pwd.SecondLogin = await this.clientCrypto.decryptDataAsync(
        pwd.SecondLogin!
      );
    }
    return pwd;
  }
}

interface LoadableSavedPassword extends UserSavedPasswordDtOsSavedPasswordDto {
  isLoaded: boolean;
}
