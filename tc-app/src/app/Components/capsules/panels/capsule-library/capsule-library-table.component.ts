import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { ILibraryItem } from '../../../../Models/models.interface';
import { DateFormatPipe } from '../../../../Pipes/date-format.pipe';
import { BaseItemsComponent } from '../base-items-component';
import { ActionButtonsComponent } from '../../../../Features/action-buttons/action-buttons.component';

@Component({
  selector: 'tc-capsule-library-table',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatTooltipModule,
    MatToolbarModule,
    MatIconModule,
    MatTableModule,
    DateFormatPipe,
    ActionButtonsComponent
  ],
  templateUrl: '../shared/templates/items-table-template.html',
  styleUrl: '../shared/templates/items-table-template.scss'
})
export class CapsuleLibraryTableComponent extends BaseItemsComponent<ILibraryItem> {

  // Define displayed columns
  displayedColumns: string[] = ['icon', 'name', 'created', 'actions'];

}
