import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, distinctUntilChanged, map, shareReplay } from "rxjs";
import { ICapsule, IItem, IRecipient, ILibraryItem } from "../Models/models.interface";

/**
 * Interface that defines the shape of the state managed by the CapsuleStateService
 */
export interface ICapsuleState {
  // Current selected entities
  currentCapsule: ICapsule | null;
  currentItem: IItem | null;
  currentRecipient: IRecipient | null;
  currentLibraryItem: ILibraryItem | null;

  // Collections of entities
  allCapsules: ICapsule[] | null;
  allItems: IItem[] | null;
  allRecipients: IRecipient[] | null;
  allLibraryItems: ILibraryItem[] | null;
}

/**
 * Helper function to compare objects by their JSON representation
 */
export function compareObjects(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

@Injectable({
  providedIn: 'root'
})
export class CapsuleStateService {
  private data = {} as ICapsuleState;
  private source: BehaviorSubject<ICapsuleState> = new BehaviorSubject<ICapsuleState>(this.resetData());

  // Refresh triggers for different entity types
  private refreshTriggers = {
    capsules: new Subject<void>(),
    items: new Subject<void>(),
    recipients: new Subject<void>()
  };

  // Public refresh observables
  readonly refreshCapsules$ = this.refreshTriggers.capsules.asObservable();
  readonly refreshItems$ = this.refreshTriggers.items.asObservable();
  readonly refreshRecipients$ = this.refreshTriggers.recipients.asObservable();

  // Observable to state to check for any change
  readonly state$: Observable<ICapsuleState> = this.source.asObservable();

  // Observable streams for the current selected entities
  readonly currentCapsule$: Observable<ICapsule | null> = this.source.pipe(
    map(data => data.currentCapsule),
    distinctUntilChanged(),
    shareReplay(1)
  );

  readonly currentItem$: Observable<IItem | null> = this.source.pipe(
    map(data => data.currentItem),
    distinctUntilChanged(compareObjects),
    shareReplay(1)
  );

  readonly currentRecipient$: Observable<IRecipient | null> = this.source.pipe(
    map(data => data.currentRecipient),
    distinctUntilChanged(compareObjects),
    shareReplay(1)
  );

  readonly currentLibraryItem$: Observable<ILibraryItem | null> = this.source.pipe(
    map(data => data.currentLibraryItem),
    distinctUntilChanged(compareObjects),
    shareReplay(1)
  );

  readonly allItems$: Observable<IItem[] | null> = this.source.pipe(
    map(data => data.allItems),
    distinctUntilChanged(compareObjects),
    shareReplay(1)
  );

  readonly allCapsules$: Observable<ICapsule[] | null> = this.source.pipe(
    map(data => data.allCapsules),
    distinctUntilChanged(compareObjects),
    shareReplay(1)
  );

  readonly allRecipients$: Observable<IRecipient[] | null> = this.source.pipe(
    map(data => data.allRecipients),
    distinctUntilChanged(compareObjects),
    shareReplay(1)
  );

  readonly allLibraryItems$: Observable<ILibraryItem[] | null> = this.source.pipe(
    map(data => data.allLibraryItems),
    distinctUntilChanged(compareObjects),
    shareReplay(1)
  );

  constructor() { }

  /**
   * Helper method to reset the state to its initial values
   */
  private resetData(): ICapsuleState {
    return {
      currentCapsule: null,
      currentItem: null,
      currentRecipient: null,
      currentLibraryItem: null,
      allCapsules: null,
      allItems: null,
      allRecipients: null,
      allLibraryItems: null
    };
  }

  /**
   * Updates the state with new values
   */
  private updateState(state: Partial<ICapsuleState>): void {
    this.data = { ...this.data, ...state };
    this.source.next(this.data);
  }

  /**
   * Sets the current capsule, its items and recipients in one operation
   * @param capsule The capsule to set as current
   */
  setCurrentCapsule(capsule: ICapsule | null): void {
    if (capsule) {
      // Update the state with the new capsule and its related data in one operation
      this.updateState({
        currentCapsule: capsule,
        // Set items and recipients from the capsule data directly
        allItems: capsule.items || [],
        allRecipients: capsule.recipients || [],
        // Reset selected item and recipient
        currentItem: null,
        currentRecipient: null
      });
    } else {
      // If capsule is null, reset everything related to capsule
      this.updateState({
        currentCapsule: null,
        allItems: [],
        allRecipients: [],
        currentItem: null,
        currentRecipient: null
      });
    }
  }
  /**
   * Sets the current item
   */
  setCurrentItem(item: IItem | null): void {
    this.updateState({ currentItem: item });
  }

  /**
   * Sets the current recipient
   */
  setCurrentRecipient(recipient: IRecipient | null): void {
    this.updateState({ currentRecipient: recipient });
  }

  /**
   * Sets the current library item
   */
  setCurrentLibraryItem(item: ILibraryItem | null): void {
    this.updateState({ currentLibraryItem: item });
  }

  /**
   * Sets the collection of all capsules
   */
  setAllCapsules(items: ICapsule[] | null): void {
    this.updateState({
      allCapsules: items || [],
      // Reset current item when changing the collection
      currentCapsule: null
    });
  }

  /**
   * Sets the collection of all items
   */
  setAllItems(items: IItem[] | null): void {
    this.updateState({
      allItems: items || [],
      // Reset current item when changing the collection
      currentItem: null
    });
  }

  /**
   * Sets the collection of all recipients
   */
  setAllRecipients(recipients: IRecipient[] | null): void {
    this.updateState({
      allRecipients: recipients || [],
      // Reset current recipient when changing the collection
      currentRecipient: null
    });
  }

  /**
   * Sets the collection of all library items
   */
  setAllLibraryItems(items: ILibraryItem[] | null): void {
    this.updateState({
      allLibraryItems: items || [],
      // Reset current library item when changing the collection
      currentLibraryItem: null
    });
  }

  /**
   * Resets the state to initial values
   */
  resetState(): void {
    this.updateState(this.resetData());
  }

  /**
   * Updates items or recipients arrays in the current capsule
   * @param items Optional updated items array
   * @param recipients Optional updated recipients array
   */
  updateCurrentCapsuleArrays(items?: IItem[], recipients?: IRecipient[]): void {
    const currentCapsule = this.data.currentCapsule;
    if (!currentCapsule) return;

    // Update arrays if provided
    if (items !== undefined) {
      currentCapsule.items = items;
    }

    if (recipients !== undefined) {
      currentCapsule.recipients = recipients;
    }

    // Notify subscribers of the change
    this.updateState({
      currentCapsule: currentCapsule
    });
  }

  /**
   * Trigger a refresh of capsules data
   */
  triggerRefreshCapsules(): void {
    this.refreshTriggers.capsules.next();
  }

  /**
   * Trigger a refresh of items data for current capsule
   */
  triggerRefreshItems(): void {
    this.refreshTriggers.items.next();
  }

  /**
   * Trigger a refresh of recipients data for current capsule
   */
  triggerRefreshRecipients(): void {
    this.refreshTriggers.recipients.next();
  }

  /**
   * Returns the current capsule
   */
  getCurrentCapsule(): ICapsule | null {
    return this.data.currentCapsule;
  }
}