import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { Subscription } from 'rxjs';
import { ICapsule } from '../../../Models/models.interface';
import { CapsulesService } from '../../../Services/api/capsules.service';
import { UI_CONSTANTS } from '../../shared/constants/ui-constants';
import { PanelViewToggleComponent, ViewToggleOptions, ViewToggleType } from '../panels/shared/elements/panel-view-toggle.component';
import { CapsuleLegendComponent } from './capsule-legend/capsule-legend.component';
import { CapsuleCardViewComponent } from './components/card/capsule-card-view.component';
import { CapsuleFormComponent } from "./components/form/capsule-form.component";
import { CapsuleTableViewComponent } from './components/table/capsule-table-view.component';
import { CapsuleAction } from './models/capsule-list.model';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'tc-capsule-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    MatChipsModule,
    TranslocoModule,
    CapsuleCardViewComponent,
    CapsuleTableViewComponent,
    CapsuleLegendComponent,
    CapsuleFormComponent,
    PanelViewToggleComponent
  ],
  templateUrl: './capsule-manager.component.html',
  styleUrls: ['./capsule-manager.component.scss']
})
export class CapsuleManagerComponent implements OnInit, OnDestroy {
  @Input() showActions = true;
  @Input() capsules: ICapsule[] | null = [];
  @Output() selectCapsule = new EventEmitter<ICapsule>();

  selectedCapsule: ICapsule | null = null;

  UI_CONSTANTS = UI_CONSTANTS;

  showLegend = false;
  viewToggleMode: ViewToggleType = 'grid';
  saveToggleMode: ViewToggleType = 'grid';
  viewToggleConfig: ViewToggleOptions = {
    visible: {
      //new: true, // can create new capsule. need subscription
      grid: true,
      list: true,
      help: true,
    }
  };

  // Observable streams from state service
  isEditMode = false;

  private subscription = new Subscription();

  constructor(
    private capsulesService: CapsulesService,
  ) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    // Init
  }

  /**
  * Handles actions from child components (view, edit, delete)
  */
  handleAction(action: CapsuleAction): void {
    this.isEditMode = false;
    this.selectedCapsule = this.capsules?.find(c => c.id === action.capsuleId) || null;
    if (!this.selectedCapsule) {
      return;
    }
    this.selectCapsule.emit(this.selectedCapsule);
    switch (action.type) {
      case 'view':
        break;

      case 'edit':
        this.isEditMode = true;
        this.saveToggleMode = this.viewToggleMode;
        break;
    }
  }

  handleFormSubmitted(capsule: ICapsule): void {
    if (capsule.id) {
      const sub = this.capsulesService.updateCapsule(capsule).subscribe(() => {
        this.selectedCapsule = {
          ...this.selectedCapsule,
          ...capsule
        }
        if (this.capsules) {
          this.capsules = this.capsules.map(c =>
            c.id === capsule.id ? { ...c, ...capsule } : c
          );
        }
        this.selectCapsule.emit(this.selectedCapsule || undefined);
        this.isEditMode = false;
      });
      this.subscription.add(sub);
    }
  }
  /**
   * Handle form cancellation
   */
  handleFormCancelled(): void {
    this.isEditMode = false;
    this.viewToggleMode = this.saveToggleMode;
  }

  /**
    * Shows/hides the legend modal, saving the current view mode
    */
  toggleLegend(): void {
    if (!this.showLegend) {
      // Before showing legend, save current view mode
      this.saveToggleMode = this.viewToggleMode;
    } else {
      // When closing legend, restore saved view mode
      this.viewToggleMode = this.saveToggleMode;
    }
    this.showLegend = !this.showLegend;
  }

  onViewModeChange(viewMode: ViewToggleType) {
    switch (viewMode) {
      case 'help':
        this.toggleLegend();
        break
      case 'new':
        this.saveToggleMode = this.viewToggleMode;
        this.isEditMode = true;
        break;
      default:
        break;
    }
    this.viewToggleMode = viewMode;
  }

  /**
   * Closes the legend when clicking on backdrop
   */
  closeOnBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('legend-overlay')) {
      this.viewToggleMode = this.saveToggleMode;
      this.showLegend = false;
    }
  }

  onSelect(capsule: ICapsule) {
    this.selectCapsule.emit(capsule);
  }

  private calcPurchasedStorage(capsules: ICapsule[]): number {
    if (!this.capsules || this.capsules.length === 0) {
      return 0;
    }
    const size = this.capsules?.reduce((acc, capsule) => {
      return acc + (capsule.plan?.limits.storage_mb || 0);
    }, 0) || 0;
    return size;
  }

  purchasedStorage(): string {
    const size = this.calcPurchasedStorage(this.capsules || []);
    return `${size.toFixed(2)} MB`;
  }

  remainingStorage() {
    if (!this.capsules || this.capsules.length === 0) {
      return '';
    }
    const purchased = this.calcPurchasedStorage(this.capsules);
    const used = this.capsules[0].totalUsage || 0;
    return `${(purchased - used).toFixed(2)} MB`;
  }
}