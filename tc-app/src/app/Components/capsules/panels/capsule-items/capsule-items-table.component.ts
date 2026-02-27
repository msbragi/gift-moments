import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { IItem } from '../../../../Models/models.interface';
import { DateFormatPipe } from '../../../../Pipes/date-format.pipe';
import { BaseItemsComponent } from '../base-items-component';
import { ActionButtonsComponent } from '../../../../Features/action-buttons/action-buttons.component';

@Component({
  selector: 'tc-capsule-items-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TranslocoModule,
    DateFormatPipe,
    ActionButtonsComponent
  ],
  templateUrl: '../shared/templates/items-table-template.html',
  styleUrl: '../shared/templates/items-table-template.scss'
})
export class CapsuleItemsTableComponent extends BaseItemsComponent<IItem> {

  // Define displayed columns
  displayedColumns: string[] = ['icon', 'name', 'created', 'actions'];


  override onItemAddToCapsule(item: any) : void {  
    // console.log('Add to capsule', item);
  }

}
