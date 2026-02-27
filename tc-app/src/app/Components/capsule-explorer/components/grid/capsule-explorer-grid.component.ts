import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { ICapsule, IItem } from '../../../../Models/models.interface';
import { ContentTypeHelper } from '../../../../Utils/content-type.helper';

@Component({
  selector: 'tc-capsule-explorer-grid',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './capsule-explorer-grid.component.html',
  styleUrl: './capsule-explorer-grid.component.scss'
})
export class CapsuleExplorerGridComponent {
  @Input() capsules: ICapsule[] = [];
  @Input() displayMode: 'assigned' | 'public' = 'assigned';
  @Output() capsuleClick = new EventEmitter<ICapsule>();

  onCapsuleClick(capsule: ICapsule): void {
    this.capsuleClick.emit(capsule);
  }

  trackByCapsuleId(index: number, capsule: ICapsule): number {
    return capsule.id || index;
  }

  isDateInPast(date: Date): boolean {
    return new Date(date) <= new Date();
  }

  formatDate(date: Date | string): string {
    return ContentTypeHelper.formatDate(date);
  }
}
