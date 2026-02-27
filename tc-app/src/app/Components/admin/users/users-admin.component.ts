import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
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
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../../Core/services/loading.service';
import { IUser } from '../../../Models/models.interface';
import { DateFormatPipe } from '../../../Pipes/date-format.pipe';
import { AdminService } from '../../../Services/api/admin.service';
import { AuthService } from '../../../Services/api/auth.service';
import { SnackbarService } from '../../../Services/common/snackbar.service';

@Component({
  selector: 'tc-users-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    DateFormatPipe,
    TranslocoModule
  ],
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.scss']
})
export class UsersAdminComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  // Table configuration
  displayedColumns: string[] = ['id', 'email', 'fullName', 'role', 'isVerified', 'disabled', 'created', 'actions'];
  dataSource = new MatTableDataSource<IUser>([]);
  
  // Current user context
  currentUser: IUser | null = null;
  
  // Filter controls
  searchFilter = new FormControl('');
  roleFilter = new FormControl('all');
  statusFilter = new FormControl('all');
  
  // All possible roles (before filtering)
  allRoles = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_user', label: 'Super User' }
  ];
  
  // Available roles for current user (filtered based on privileges)
  availableRoles: { value: string; label: string }[] = [];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    public loadingService: LoadingService,
    public translocoService: TranslocoService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    // Set initial filter values
    this.roleFilter.setValue('all');
    this.statusFilter.setValue('all');
    this.searchFilter.setValue('');
    
    // Get current user from AuthService to determine role restrictions
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (user) {
            this.currentUser = user;
            this.setAvailableRoles();
          }
        },
        error: () => {
          console.error('Failed to get current user for role restrictions');
          // Fallback to most restrictive permissions
          this.availableRoles = [{ value: 'user', label: 'User' }];
        }
      });
    
    this.setupFilters();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Set available roles based on current user's privileges
   * - Regular admins can assign: user, admin
   * - Super users can assign: user, admin, super_user
   */
  private setAvailableRoles(): void {
    if (!this.currentUser) {
      // Fallback to most restrictive
      this.availableRoles = [{ value: 'user', label: 'User' }];
      return;
    }

    if (this.currentUser.role === 'super_user') {
      // Super users can assign any role
      this.availableRoles = [...this.allRoles];
    } else if (this.currentUser.role === 'admin') {
      // Regular admins cannot assign super_user role
      this.availableRoles = this.allRoles.filter(role => role.value !== 'super_user');
    } else {
      // Non-admin users shouldn't reach here, but safety fallback
      this.availableRoles = [{ value: 'user', label: 'User' }];
    }
  }

  /**
   * Check if current user can assign a specific role
   */
  private canAssignRole(role: string): boolean {
    return this.availableRoles.some(availableRole => availableRole.value === role);
  }

  /**
   * Load all users from the API
   */
  private loadUsers(): void {
    console.log('UsersAdminComponent: Loading users...');
    this.adminService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          // Handle case where service might return full response object
          let userArray: IUser[];
          if (Array.isArray(users)) {
            userArray = users;
          } else if (users && (users as any).users) {
            userArray = (users as any).users;
          } else {
            userArray = [];
          }
          
          this.dataSource.data = userArray;
        }
      });
  }

  /**
   * Setup filter controls and their behavior
   */
  private setupFilters(): void {
    // Search filter
    this.searchFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.applyFilters();
      });

    // Role filter
    this.roleFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.applyFilters();
      });

    // Status filter
    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.applyFilters();
      });
  }

  /**
   * Apply all active filters to the data source
   */
  private applyFilters(): void {
    const searchTerm = this.searchFilter.value?.toLowerCase() || '';
    const roleFilter = this.roleFilter.value;
    const statusFilter = this.statusFilter.value;

    console.log('ApplyFilters called with:', { searchTerm, roleFilter, statusFilter });

    this.dataSource.filterPredicate = (user: IUser, filter: string) => {
      // Search filter (email, fullName)
      const matchesSearch = !searchTerm || 
        user.email.toLowerCase().includes(searchTerm) ||
        (user.fullName?.toLowerCase().includes(searchTerm) || false);

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Status filter (active/disabled) - treat undefined as enabled
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && !user.disabled) ||
        (statusFilter === 'disabled' && !!user.disabled);

      console.log(`User ${user.email}: search=${matchesSearch}, role=${matchesRole}, status=${matchesStatus}, user.disabled=${user.disabled}`);
      
      return matchesSearch && matchesRole && matchesStatus;
    };

    this.dataSource.filter = 'trigger'; // Trigger filter update
    console.log('Filtered data count:', this.dataSource.filteredData.length);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchFilter.setValue('');
    this.roleFilter.setValue('all');
    this.statusFilter.setValue('all');
  }

  /**
   * Update user role with privilege checking
   */
  updateUserRole(userId: number, newRole: string): void {
    // Security check: Prevent self-modification
    if (this.currentUser && userId === this.currentUser.id) {
      this.snackbar.error(
        this.translocoService.translate('admin.users.cannot_modify_self')
      );
      return;
    }

    // Security check: Verify current user can assign this role
    if (!this.canAssignRole(newRole)) {
      this.snackbar.error(
        this.translocoService.translate('admin.users.insufficient_privileges')
      );
      return;
    }

    // Security check: Only super users can edit other super users
    const targetUser = this.dataSource.data.find(u => u.id === userId);
    if (targetUser?.role === 'super_user' && this.currentUser?.role !== 'super_user') {
      this.snackbar.error(
        this.translocoService.translate('admin.users.insufficient_privileges')
      );
      return;
    }

    this.adminService.updateUserRole(userId, newRole)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Find and update only the role property
          const user = this.dataSource.data.find(u => u.id === userId);
          if (user) {
            user.role = newRole;
          }
        }
      });
  }

  /**
   * Toggle user disabled status
   */
  toggleUserStatus(userId: number, currentStatus: boolean): void {
    // Security check: Prevent self-modification
    if (this.currentUser && userId === this.currentUser.id) {
      this.snackbar.error(
        this.translocoService.translate('admin.users.cannot_modify_self')
      );
      return;
    }

    const newStatus = !currentStatus;
    
    this.adminService.updateUserStatus(userId, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Find and update only the disabled property
          const user = this.dataSource.data.find(u => u.id === userId);
          if (user) {
            user.disabled = newStatus;
          }
        }
      });
  }

  /**
   * Refresh the user list
   */
  refreshUsers(): void {
    this.loadUsers();
  }

  /**
   * Get role display label
   */
  getRoleLabel(role: string): string {
    const roleObj = this.allRoles.find((r: { value: string; label: string }) => r.value === role);
    return roleObj?.label || role;
  }

  /**
   * Check if current user can edit this user
   */
  canEditUser(user: IUser): boolean {
    if (!this.currentUser) {
      return false;
    }

    // Security check: Cannot modify yourself
    if (user.id === this.currentUser.id) {
      return false;
    }

    // Super users can edit anyone (except themselves)
    if (this.currentUser.role === 'super_user') {
      return true;
    }

    // Regular admins cannot edit super users or other admins
    if (user.role === 'super_user' || user.role === 'admin') {
      return false;
    }

    // Regular admins can edit ordinary users
    return this.currentUser.role === 'admin';
  }

  /**
   * Get available roles for a specific user (considering edit restrictions)
   */
  getAvailableRolesForUser(user: IUser): { value: string; label: string }[] {
    if (!this.canEditUser(user)) {
      return [];
    }

    // If editing a super user, only super users can do anything
    if (user.role === 'super_user' && this.currentUser?.role !== 'super_user') {
      return [];
    }

    return this.availableRoles;
  }
}
