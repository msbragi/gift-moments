import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ICapsule } from '../../../../../Models/models.interface';
import { CapsuleBaseListComponent } from '../capsule-base-list.component';
import { CapsuleActionsComponent } from '../shared/capsule-actions.component';
import { CapsuleStatusComponent } from '../shared/capsule-status.component';

@Component({
    selector: 'tc-capsule-table-view',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatSortModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        RouterLink,
        TranslocoModule,
        CapsuleActionsComponent,
        CapsuleStatusComponent
    ],
    templateUrl: './capsule-table-view.component.html',
    styleUrls: ['./capsule-table-view.component.scss']
})
export class CapsuleTableViewComponent extends CapsuleBaseListComponent implements OnInit {
    // Columns to display in the table
    displayedColumns: string[] = ['name', 'openDate', 'itemsCount', 'status', 'actions'];

    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatTable) table!: MatTable<ICapsule>;

    constructor() {
        super();
    }

    onRowClick(capsule: ICapsule): void {
        // Only handle row click for viewing, not when clicking on actions
        this.action.emit({ type: 'view', capsuleId: capsule.id || 0 });
    }
}