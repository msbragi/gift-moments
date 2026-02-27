import { Injectable, signal } from '@angular/core';

export type UI_REFRESH = 'recipients' | 'library' | 'items' | null;
export type UI_REFRESH_SIGNAL = { type: UI_REFRESH; tick: number };

@Injectable({ providedIn: 'root' })
export class CapsulesUIRefreshService {
  readonly refreshSignal = signal<UI_REFRESH_SIGNAL>({ type: null, tick: 0 });

  triggerRefresh(type: UI_REFRESH): void {
    this.refreshSignal.update(prev => ({
      type,
      tick: prev.tick + 1
    }));
  }
}