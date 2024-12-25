import { effect, signal } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';

export class TypedFormGroup<T extends Record<string, any>> extends FormGroup {
  isLoading = signal(false);
  constructor(
    controls: { [K in keyof T]: FormControl<T[K]> | AbstractControl<T[K]> },
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);

    effect(() => {
      if (this.isLoading()) {
        this.disable();
      } else {
        this.enable();
      }
    });
  }

  // Override the `get` method to enforce type safety
  override get<K extends keyof T>(path: K): AbstractControl<T[K]> | null {
    return super.get(path as string) as AbstractControl<T[K]> | null;
  }

  // Optionally add other type-safe methods here
}
