import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { ILibraryItem } from '../../../../Models/models.interface';
import { DateFormatPipe } from '../../../../Pipes/date-format.pipe';
import { BaseItemsComponent } from '../base-items-component';
import { ActionButtonsComponent } from '../../../../Features/action-buttons/action-buttons.component';

@Component({
  selector: 'tc-capsule-library-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TranslocoModule,
    DateFormatPipe,
    ActionButtonsComponent
  ],
  templateUrl: '../shared/templates/items-card-template.html',
  styleUrl: '../shared/templates/items-card-template.scss'
})
export class CapsuleLibraryCardComponent extends BaseItemsComponent<ILibraryItem> {

}
