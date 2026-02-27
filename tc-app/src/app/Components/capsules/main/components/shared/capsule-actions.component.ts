import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { CapsuleAction } from '../../models/capsule-list.model';
import { UI_CONSTANTS } from '../../../../shared/constants/ui-constants';

@Component({
  selector: 'tc-capsule-actions',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, TranslocoModule],
  template: `
    <div *transloco="let t" class="action-buttons">
      <button mat-icon-button 
              class="view-button"
              [matTooltip]="t(UI_CONSTANTS.actions.view.tooltip)" 
              (click)="onAction('view')">
        <mat-icon>{{ UI_CONSTANTS.actions.view.icon }}</mat-icon>
      </button>
      <button mat-icon-button 
              class="edit-button"
              [matTooltip]="t(UI_CONSTANTS.actions.edit.tooltip)" 
              (click)="onAction('edit')">
        <mat-icon>{{ UI_CONSTANTS.actions.edit.icon }}</mat-icon>
      </button>
      <!-- No delete supported for paid capsule
      <button mat-icon-button 
              class="delete-button"
              [matTooltip]="t(UI_CONSTANTS.actions.delete.tooltip)" 
              (click)="onAction('delete')">
        <mat-icon>{{ UI_CONSTANTS.actions.delete.icon }}</mat-icon>
      </button>
      -->
    </div>
  `,
  styles: [`
    .action-buttons {
      display: flex;
      gap: 4px;
    }
  `]
})
export class CapsuleActionsComponent {
  @Input() capsuleId!: number;
  @Output() action = new EventEmitter<CapsuleAction>();
  
  // Make constants available in the template
  protected UI_CONSTANTS = UI_CONSTANTS;
  
  onAction(type: 'view' | 'edit' | 'delete'): void {
    this.action.emit({ type, capsuleId: this.capsuleId });
  }
}