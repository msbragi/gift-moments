import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { DateFormatPipe } from '../../../../../Pipes/date-format.pipe';
import { CapsuleBaseListComponent } from '../capsule-base-list.component';
import { CapsuleActionsComponent } from '../shared/capsule-actions.component';
import { ICapsule } from '../../../../../Models/models.interface';

@Component({
  selector: 'tc-capsule-card-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChip,
    MatTooltipModule,
    MatButtonModule,
    RouterLink,
    TranslocoModule,
    DateFormatPipe,
    CapsuleActionsComponent
  ],
  templateUrl: './capsule-card-view.component.html',
  styleUrls: ['./capsule-card-view.component.scss']
})
export class CapsuleCardViewComponent extends CapsuleBaseListComponent implements OnInit {
  constructor() {
    super();
  }
  
}