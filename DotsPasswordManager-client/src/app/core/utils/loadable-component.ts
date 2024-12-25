import { signal, WritableSignal } from '@angular/core';

export class LoadableComponent {
  loadingOperations = new Map<string, WritableSignal<boolean>>();

  setLoading(key: string, value: boolean) {
    if (!this.loadingOperations.has(key)) {
      this.loadingOperations.set(key, signal(value));
    } else {
      const op = this.loadingOperations.get(key);
      op?.set(value);
    }
  }

  getLoading(key: string) {
    if (!this.loadingOperations.has(key)) {
      this.loadingOperations.set(key, signal(false));
    }
    return this.loadingOperations.get(key);
  }
}
