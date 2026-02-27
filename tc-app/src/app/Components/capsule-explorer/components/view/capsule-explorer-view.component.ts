import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { ICapsule } from '../../../../Models/models.interface';
import { ContentTypeHelper } from '../../../../Utils/content-type.helper';
import { CapsuleExplorerItemsComponent } from '../items/capsule-explorer-items.component';
import { CapsuleExplorerMapComponent } from '../map/capsule-explorer-map.component';

@Component({
  selector: 'tc-capsule-explorer-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    CapsuleExplorerItemsComponent,
    CapsuleExplorerMapComponent
  ],
  templateUrl: './capsule-explorer-view.component.html',
  styleUrl: './capsule-explorer-view.component.scss'
})
export class CapsuleExplorerViewComponent {
  @Input() capsule: ICapsule | null = null;
  @Output() backToGrid = new EventEmitter<void>();

  onBackClick(): void {
    this.backToGrid.emit();
  }

  isDateInPast(date: Date): boolean {
    return new Date(date) <= new Date();
  }

  formatDate(date: Date | string): string {
    return ContentTypeHelper.formatDate(date);
  }
}