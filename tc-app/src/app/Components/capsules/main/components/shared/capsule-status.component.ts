import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { ICapsule } from '../../../../../Models/models.interface';
import { UI_CONSTANTS } from '../../../../shared/constants/ui-constants';

interface StatusIcon {
  icon: string;
  tooltip: string;
  color?: string;
}

@Component({
  selector: 'tc-capsule-status',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, TranslocoModule],
  template: `
    <div *transloco="let t" class="status-icons">
      <span *ngFor="let statusIcon of getStatusIcons()" 
            class="status-icon" 
            [matTooltip]="t(statusIcon.tooltip)"
            [matTooltipPosition]="'above'">
        <mat-icon [color]="statusIcon.color">{{ statusIcon.icon }}</mat-icon>
      </span>
    </div>
  `,
  styles: [`
    .status-icons {
      display: flex;
      gap: 4px;
    }
    
    .status-icon {
      display: inline-flex;
    }
  `]
})
export class CapsuleStatusComponent {
  @Input() capsule!: ICapsule;
  @Input() showAll = false; // Control whether to show all status icons or just highlights
  
  // Make constants available in the template
  protected UI_CONSTANTS = UI_CONSTANTS;
  
  getStatusIcons(): StatusIcon[] {
    const icons: StatusIcon[] = [];
    const now = new Date();
    
    // Visibility Status
    if (!this.capsule.isPublic) {
      icons.push({ 
        icon: UI_CONSTANTS.status.visibility.private.icon, 
        tooltip: UI_CONSTANTS.status.visibility.private.tooltip
      });
    } else {
      icons.push({ 
        icon: UI_CONSTANTS.status.visibility.public.icon, 
        tooltip: UI_CONSTANTS.status.visibility.public.tooltip 
      });
    }
    
    // Access Status
    if (this.capsule.isOpen) {
      icons.push({ 
        icon: UI_CONSTANTS.status.access.opened.icon, 
        tooltip: UI_CONSTANTS.status.access.opened.tooltip 
      });
    } else {
      const openDate = new Date(this.capsule.openDate);
      
      if (openDate <= now) {
        icons.push({ 
          icon: UI_CONSTANTS.status.access.openable.icon, 
          tooltip: UI_CONSTANTS.status.access.openable.tooltip,
          color: 'primary'
        });
      } else {
        icons.push({ 
          icon: UI_CONSTANTS.status.access.locked.icon, 
          tooltip: UI_CONSTANTS.status.access.locked.tooltip 
        });
      }
    }
    
    // Location Type
    if (!this.capsule.isPhysical) {
      icons.push({ 
        icon: UI_CONSTANTS.status.location.digital.icon, 
        tooltip: UI_CONSTANTS.status.location.digital.tooltip 
      });
    } else {
      icons.push({ 
        icon: UI_CONSTANTS.status.location.physical.icon, 
        tooltip: UI_CONSTANTS.status.location.physical.tooltip 
      });
    }
    
    return icons;
  }
}