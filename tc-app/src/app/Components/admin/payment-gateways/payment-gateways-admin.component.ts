import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../../Core/services/loading.service';
import { CreateGatewayDto, IPaymentGateway } from '../../../Models/payment-gateway.interface';
import { DateFormatPipe } from '../../../Pipes/date-format.pipe';
import { AdminService } from '../../../Services/api/admin.service';
import { SnackbarService } from '../../../Services/common/snackbar.service';

@Component({
  selector: 'tc-payment-gateways-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule,
    DateFormatPipe
  ],
  templateUrl: './payment-gateways-admin.component.html',
  styleUrls: ['./payment-gateways-admin.component.scss']
})
export class PaymentGatewaysAdminComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  dataSource = new MatTableDataSource<IPaymentGateway>();
  displayedColumns: string[] = ['id', 'gatewayName', 'gatewayCode', 'isActive', 'created', 'actions'];
  
  searchFilter = new FormControl('');
  statusFilter = new FormControl('all');
  
  isEditing = false;
  editingGateway: IPaymentGateway | null = null;
  
  gatewayForm = new FormGroup({
    gatewayCode: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    gatewayName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    isActive: new FormControl(true),
    apiKeyPublic: new FormControl(''),
    apiKeySecret: new FormControl(''),
    webhookSecret: new FormControl(''),
    webhookUrl: new FormControl('')
  });

  allStatuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  availableGatewayCodes = [
    { value: '', label: '' },
  ];

  constructor(
    private adminService: AdminService,
    public loadingService: LoadingService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadGateways();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGateways(): void {
    this.adminService.getPaymentGateways()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (gateways) => {
          this.availableGatewayCodes = gateways.map(g => ({ value: g.gatewayCode, label: `${g.gatewayName} (${g.gatewayCode.toUpperCase()})` }));
          this.dataSource.data = gateways;
        }
      });
  }

  setupFilters(): void {
    // Search filter
    this.searchFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.dataSource.filter = (value || '').trim().toLowerCase();
      });

    // Status filter
    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.dataSource.filterPredicate = (data: IPaymentGateway, filter: string) => {
          const searchTerm = filter.toLowerCase();
          const matchesSearch = !searchTerm || 
            data.gatewayName.toLowerCase().includes(searchTerm) ||
            data.gatewayCode.toLowerCase().includes(searchTerm);

          const matchesStatus = status === 'all' || 
            (status === 'active' && data.isActive) ||
            (status === 'inactive' && !data.isActive);

          return matchesSearch && matchesStatus;
        };
        
        // Trigger filter update
        this.dataSource.filter = this.searchFilter.value || '';
      });
  }

  clearFilters(): void {
    this.searchFilter.setValue('');
    this.statusFilter.setValue('all');
  }

  startCreate(): void {
    this.isEditing = true;
    this.editingGateway = null;
    this.gatewayForm.reset({
      gatewayCode: '',
      gatewayName: '',
      isActive: true,
      apiKeyPublic: '',
      apiKeySecret: '',
      webhookSecret: '',
      webhookUrl: ''
    });
  }

  startEdit(gateway: IPaymentGateway): void {
    this.isEditing = true;
    this.editingGateway = gateway;
    this.gatewayForm.patchValue({
      gatewayCode: gateway.gatewayCode,
      gatewayName: gateway.gatewayName,
      isActive: gateway.isActive,
      apiKeyPublic: gateway.apiKeyPublic || '',
      apiKeySecret: gateway.apiKeySecret || '',
      webhookSecret: gateway.webhookSecret || '',
      webhookUrl: gateway.webhookUrl || ''
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingGateway = null;
    this.gatewayForm.reset();
  }

  saveGateway(): void {
    if (this.gatewayForm.invalid) {
      this.snackbarService.error('Please fill in all required fields');
      return;
    }

    const formValue = this.gatewayForm.value;
    const gatewayData = {
      gatewayCode: formValue.gatewayCode!,
      gatewayName: formValue.gatewayName!,
      isActive: formValue.isActive!,
      apiKeyPublic: formValue.apiKeyPublic || undefined,
      apiKeySecret: formValue.apiKeySecret || undefined,
      webhookSecret: formValue.webhookSecret || undefined,
      webhookUrl: formValue.webhookUrl || undefined
    };

    if (this.editingGateway) {
      // Update existing gateway
      this.adminService.updatePaymentGateway(this.editingGateway.id, gatewayData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackbarService.success('Payment gateway updated successfully');
            this.cancelEdit();
            this.loadGateways();
          }
        });
    } else {
      // Create new gateway
      this.adminService.createPaymentGateway(gatewayData as CreateGatewayDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackbarService.success('Payment gateway created successfully');
            this.cancelEdit();
            this.loadGateways();
          }
        });
    }
  }

  toggleGatewayStatus(gateway: IPaymentGateway): void {
    this.adminService.togglePaymentGatewayStatus(gateway.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const status = gateway.isActive ? 'disabled' : 'enabled';
          this.snackbarService.success(`Payment gateway ${status} successfully`);
          this.loadGateways();
        }
      });
  }

  deleteGateway(gateway: IPaymentGateway): void {
    if (confirm(`Are you sure you want to delete the ${gateway.gatewayName} gateway? This action cannot be undone.`)) {
      this.adminService.deletePaymentGateway(gateway.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackbarService.success('Payment gateway deleted successfully');
            this.loadGateways();
          }
        });
    }
  }

  refreshGateways(): void {
    this.loadGateways();
  }
}
