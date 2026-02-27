import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Observable, of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfirmDialogService } from '../../../../Features/confirm/confirm-dialog.service';
import { ICapsule, IRecipient } from '../../../../Models/models.interface';
import { RecipientsService } from '../../../../Services/api/recipients.service';
import { CapsulesUIRefreshService } from '../../capsules-ui-refresh.service';
import { PanelViewToggleComponent, ViewToggleOptions, ViewToggleType } from '../shared/elements/panel-view-toggle.component';
import { CapsuleRecipientDialogComponent, RecipientDialogData } from './capsule-recipient-dialog.component';


@Component({
  selector: 'tc-capsule-recipients',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatTableModule,
    MatDividerModule,
    MatDialogModule,
    TranslocoModule,
    PanelViewToggleComponent
  ],
  templateUrl: './capsule-recipients.component.html',
  styleUrl: './capsule-recipients.component.scss',
  providers: [
    // Non necessario per ora, ma potremmo aggiungere provideDialog qui se necessario in futuro
  ]
})
export class CapsuleRecipientsComponent implements OnDestroy {

  recipients$: Observable<IRecipient[]> = of([]);

  // Current capsule and recipients
  private _currentCapsule: ICapsule | null = null;
  @Input() set currentCapsule(value: ICapsule | null) {
    this._currentCapsule = value;
    this.recipients$ = of(value?.recipients ?? []);
  }
  get currentCapsule(): ICapsule | null {
    return this._currentCapsule;
  }

  // Display columns for table view
  displayedColumns: string[] = ['email', 'fullName', 'hasOpened', 'notified', 'actions'];

  // View toggle configuration
  viewToggleMode: ViewToggleType = 'grid';
  viewToggleConfig: ViewToggleOptions = {
    visible: {
      grid: true,
      list: true
    }
  };

  private subscriptions = new Subscription();

  constructor(
    private UIRefreshService: CapsulesUIRefreshService,
    private recipientsService: RecipientsService,
    private dialog: MatDialog,
    private translocoService: TranslocoService,
    private confirmService: ConfirmDialogService
  ) {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Handle view toggle mode change
   * @param mode The new view mode
   */
  onViewModeChange(mode: ViewToggleType): void {
    this.viewToggleMode = mode;
  }
  /**
   * Remove a recipient from the capsule
   * @param recipient The recipient to remove
   */
  removeRecipient(recipient: IRecipient): void {
    if (!recipient.id || !this.currentCapsule || !this.currentCapsule.id) return;
    const capsuleId = this.currentCapsule.id;

    // Show confirmation dialog before deleting
    this.confirmService.open({
      title: this.translocoService.translate('recipients.confirmDelete'),
      message: this.translocoService.translate('recipients.deleteMessage', { email: recipient.email })
    }).subscribe(confirmed => {
      if (confirmed) {
        if (!this.currentCapsule?.id) return;
        this.recipientsService.deleteRecipient(capsuleId, recipient.id!)
          .pipe(
            tap(() => {
              this.refreshRecipients();
            })
          ).subscribe();
      }
    });
  }

  /**
   * Open dialog to add a new recipient
   */
  addNewRecipient(): void {
    if (!this.currentCapsule || !this.currentCapsule.id) return;
    const capsuleId = this.currentCapsule.id;

    const dialogRef = this.dialog.open(CapsuleRecipientDialogComponent, {
      width: '400px',
      data: {
        capsuleId: this.currentCapsule.id,
        title: this.translocoService.translate('recipients.dialog.addTitle')
      } as RecipientDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add capsuleId to the result data
        const newRecipient = {
          ...result,
          capsuleId: capsuleId
        };
        this.recipientsService.createRecipient(capsuleId, newRecipient)
          .pipe(
            tap(() => {
              this.refreshRecipients();
            })
          ).subscribe();
      }
    });
  }

  /**
   * Open dialog to edit an existing recipient
   * @param recipient The recipient to edit
   */
  editRecipient(recipient: IRecipient): void {
    if (!this.currentCapsule || !this.currentCapsule.id || !recipient.id) return;
    const capsuleId = this.currentCapsule.id;

    const dialogRef = this.dialog.open(CapsuleRecipientDialogComponent, {
      width: '400px',
      data: {
        capsuleId: this.currentCapsule.id,
        recipient: recipient,
        title: this.translocoService.translate('recipients.dialog.editTitle')
      } as RecipientDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Merge existing recipient with updated data
        const updatedRecipient = {
          ...recipient,
          ...result
        };

        this.recipientsService.updateRecipient(capsuleId, updatedRecipient)
          .pipe(
            tap(() => {
              // Refresh recipients list
              this.refreshRecipients();
            })
          ).subscribe();
      }
    });
  }

  /**
   * Send notifications to all recipients of the current capsule
   * This is a placeholder for future implementation
   */
  sendNotificationsToAll(): void {
    if(!this.currentCapsule || !this.currentCapsule.id) return;
    this.recipientsService.notifyAllRecipients(this.currentCapsule.id)
      .pipe(
        tap(() => {
          this.refreshRecipients();
        })
      ).subscribe();
  }

  sendNotificationToRecipient(recipient: IRecipient) {
    if(!this.currentCapsule || !this.currentCapsule.id || !recipient.id) return;
    this.recipientsService.notifyRecipient(this.currentCapsule.id, recipient.id!)
      .pipe(
        tap(() => {
          this.refreshRecipients();
        })
      ).subscribe();
  }

  /**
     * Refresh the recipients list using the state service
     */
  refreshRecipients(): void {
    this.UIRefreshService.triggerRefresh('recipients');
  }
}