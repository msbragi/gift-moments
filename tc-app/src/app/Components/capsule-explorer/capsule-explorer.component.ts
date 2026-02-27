import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ICapsule } from '../../Models/models.interface';
import { CapsulesService } from '../../Services/api/capsules.service';
import { CapsuleLegendComponent } from '../capsules/main/capsule-legend/capsule-legend.component';
import { CapsuleExplorerGridComponent } from './components/grid/capsule-explorer-grid.component';
import { CapsuleExplorerViewComponent } from './components/view/capsule-explorer-view.component';

@Component({
  selector: 'tc-capsule-explorer',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatCardModule,
    CapsuleLegendComponent,
    CapsuleExplorerGridComponent,
    CapsuleExplorerViewComponent
  ],
  templateUrl: './capsule-explorer.component.html',
  styleUrl: './capsule-explorer.component.scss'
})
export class CapsuleExplorerComponent implements OnInit, OnDestroy {
  assignedCapsules: ICapsule[] = [];
  publicCapsules: ICapsule[] = [];
  displayMode: 'assigned' | 'public' = 'assigned';
  viewMode: 'grid' | 'single' = 'grid';
  selectedCapsule: ICapsule | null = null;
  showToggle = true;
  showLegend = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private capsuleService: CapsulesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check query parameters to set initial display mode
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['type'] === 'public') {
        this.displayMode = 'public';
      } else if (params['type'] === 'assigned') {
        this.displayMode = 'assigned';
      }
    });
    
    this.loadCapsules();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get displayedCapsules(): ICapsule[] {
    return this.displayMode === 'assigned' ? this.assignedCapsules : this.publicCapsules;
  }

  onToggleChange(isPublic: boolean): void {
    this.displayMode = isPublic ? 'public' : 'assigned';
  }

  onCapsuleClick(capsule: ICapsule): void {
    this.selectedCapsule = capsule;
    this.viewMode = 'single';
  }

  onBackToGrid(): void {
    this.viewMode = 'grid';
    this.selectedCapsule = null;
  }

  /**
    * Shows/hides the legend modal, saving the current view mode
    */
  toggleLegend(): void {
    this.showLegend = !this.showLegend;
  }

  /**
   * Closes the legend when clicking on backdrop
   */
  closeOnBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('legend-overlay')) {
      this.showLegend = false;
    }
  }

  private loadCapsules(): void {
    forkJoin({
      assigned: this.capsuleService.getAssignedCapsules(),
      public: this.capsuleService.getPublicCapsules()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ assigned, public: publicCapsules }) => {
        this.assignedCapsules = assigned;
        this.publicCapsules = publicCapsules;
        
        // Hide toggle if no assigned capsules and switch to public
        if (assigned.length === 0) {
          this.showToggle = false;
          this.displayMode = 'public';
        }
      }
    });
  }
}