import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IResponse } from '../../Models/auth.interface';
import { IUser } from '../../Models/models.interface';
import { CreateGatewayDto, IPaymentGateway, PaymentGatewayStats, UpdateGatewayDto } from '../../Models/payment-gateway.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private apiService: ApiService) { }

  /**
   * Get all users (admin only)
   * @returns Observable with users array
   */
  getAllUsers(): Observable<IUser[]> {
    return this.apiService.get<IResponse>('admin/users').pipe(
      map((response: IResponse) => {
        const users = response.data.users as IUser[];
        return users;
      })
    );
  }

  /**
   * Update user role (admin only)
   * @param userId User ID to update
   * @param role New role ('user', 'admin', or 'super_user')
   * @returns Observable with updated user data
   */
  updateUserRole(userId: number, role: string): Observable<IUser> {
    return this.apiService.patch<IResponse>(`admin/users/${userId}/role`, { role }, 'User role updated successfully').pipe(
      map((response: IResponse) => {
        return response.data.user as IUser;
      })
    );
  }

  /**
   * Update user disabled status (admin only)
   * @param userId User ID to update
   * @param disabled Whether the user should be disabled
   * @returns Observable with updated user data
   */
  updateUserStatus(userId: number, disabled: boolean): Observable<IUser> {
    return this.apiService.patch<IResponse>(`admin/users/${userId}/status`, { disabled }, 'User status updated successfully').pipe(
      map((response: IResponse) => {
        return response.data.user as IUser;
      })
    );
  }

  /**
   * Get admin statistics (admin only)
   * @returns Observable with admin statistics
   */
  getAdminStatistics(): Observable<any> {
    return this.apiService.get<IResponse>('admin/stats').pipe(
      map((response: IResponse) => {
        return response.data;
      })
    );
  }

  // ============ PAYMENT GATEWAY ADMIN METHODS ============

  /**
   * Get all payment gateways (admin only)
   * @returns Observable with payment gateways array
   */
  getPaymentGateways(): Observable<IPaymentGateway[]> {
    return this.apiService.get<IResponse>('admin/payment-gateways').pipe(
      map((response: IResponse) => {
        return response.data as IPaymentGateway[];
      })
    );
  }

  /**
   * Get payment gateway by ID (admin only)
   * @param id Gateway ID
   * @returns Observable with payment gateway
   */
  getPaymentGateway(id: number): Observable<IPaymentGateway> {
    return this.apiService.get<IResponse>(`admin/payment-gateways/${id}`).pipe(
      map((response: IResponse) => {
        return response.data as IPaymentGateway;
      })
    );
  }

  /**
   * Create new payment gateway (admin only)
   * @param gatewayData Gateway data
   * @returns Observable with created gateway
   */
  createPaymentGateway(gatewayData: CreateGatewayDto): Observable<IPaymentGateway> {
    return this.apiService.post<IResponse>('admin/payment-gateways', gatewayData).pipe(
      map((response: IResponse) => {
        return response.data as IPaymentGateway;
      })
    );
  }

  /**
   * Update payment gateway (admin only)
   * @param id Gateway ID
   * @param updateData Update data
   * @returns Observable with updated gateway
   */
  updatePaymentGateway(id: number, updateData: UpdateGatewayDto): Observable<IPaymentGateway> {
    return this.apiService.patch<IResponse>(`admin/payment-gateways/${id}`, updateData).pipe(
      map((response: IResponse) => {
        return response.data as IPaymentGateway;
      })
    );
  }

  /**
   * Delete payment gateway (admin only)
   * @param id Gateway ID
   * @returns Observable with success message
   */
  deletePaymentGateway(id: number): Observable<any> {
    return this.apiService.delete<IResponse>(`admin/payment-gateways/${id}`).pipe(
      map((response: IResponse) => {
        return response.data;
      })
    );
  }

  /**
   * Toggle payment gateway status (admin only)
   * @param id Gateway ID
   * @returns Observable with updated gateway
   */
  togglePaymentGatewayStatus(id: number): Observable<IPaymentGateway> {
    return this.apiService.patch<IResponse>(`admin/payment-gateways/${id}/toggle-status`, {}).pipe(
      map((response: IResponse) => {
        return response.data as IPaymentGateway;
      })
    );
  }

  /**
   * Get payment gateway statistics (admin only)
   * @param id Gateway ID
   * @returns Observable with gateway stats
   */
  getPaymentGatewayStats(id: number): Observable<PaymentGatewayStats> {
    return this.apiService.get<IResponse>(`admin/payment-gateways/${id}/stats`).pipe(
      map((response: IResponse) => {
        return response.data as PaymentGatewayStats;
      })
    );
  }
}
