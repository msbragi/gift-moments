import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ICapsule } from '../../../../Models/models.interface';
import { UI_CONSTANTS } from '../../../shared/constants/ui-constants';
import { CapsuleAction } from '../models/capsule-list.model';
import { SUBSCRIPTION_UI_PLANS } from '../../../../Models/subscription-ui-config.model';

@Component({
  selector: '',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: ''
})
export class CapsuleBaseListComponent implements OnInit {
  @Input() capsules: ICapsule[] = [];
  @Input() currentCapsule: ICapsule | null = null;
  @Input() showActions = true;
  @Output() action = new EventEmitter<CapsuleAction>();

  protected UI_CONSTANTS = UI_CONSTANTS;
  protected UI_SUBSCRIPTION = SUBSCRIPTION_UI_PLANS;

  constructor() { }

  ngOnInit(): void {
    //console.log(this.currentCapsule);
  }

  isSelected(capsule: ICapsule): boolean {
    return capsule?.id !== undefined && this.currentCapsule?.id === capsule.id;
  }

  onAction(action: CapsuleAction, capsule: ICapsule): void {
    this.currentCapsule = capsule;
    this.action.emit(action);
  }

  selectCapsule(capsule: ICapsule) {
    if (this.isSelected(capsule)) {
      return; // Already selected, no action needed
    }
    if (capsule.id) {
      this.onAction({ type: 'view', capsuleId: capsule.id }, capsule);
    }
  }

  // Helper method for date comparison in the template
  isDateInPast(dateString: string | Date): boolean {
    const date = new Date(dateString);
    const now = new Date();
    return date <= now;
  }

  getPlanIcon(capsule: ICapsule): string {
    if (!capsule || !capsule.plan?.name) {
      return 'star';
    }
    const icon = SUBSCRIPTION_UI_PLANS[capsule.plan.name]?.icon || 'star';
    return icon;
  }

  calcStorage(capsule: ICapsule) {
    const storage = (capsule.plan?.limits?.storage_mb || 0) - (capsule.usage?.storage_mb || 0);
    return Math.round(storage * 100) / 100; // Round to 2 decimal places
  }

}