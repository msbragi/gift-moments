import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminRequired } from 'src/common/decorators/admin-required.decorator';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { User } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  AdminUpdateUserRoleDto,
  AdminUpdateUserStatusDto,
  AdminUserListQueryDto
} from '../users/dto/admin-update-user.dto';
import { AdminService } from './admin.service';
import { IPaymentGateway } from 'src/common/interfaces/models.interface';

@ApiTags('admin')
@ApiBearerAuth('jwt-auth')
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard)
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('debug/me')
  @ApiOperation({ summary: 'Debug endpoint to check user data from JWT' })
  @ApiResponse({ status: 200, description: 'User data from JWT token' })

  async debugMe(@User() user: any) {
    return {
      user,
      hasRole: !!user.role,
      isAdmin: user.role === 'admin' || user.role === 'super_user',
      isSuperUser: user.role === 'super_user',
      isDisabled: user.disabled,
    };
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @AdminRequired()  // Both admins and super users can access
  async getUsers(
    @Query() query: AdminUserListQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role - Admin can assign admin role to ordinary users, Super user can assign any role' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @AdminRequired()  // Both admins and super users can access
  async updateUserRole(
    @User() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: AdminUpdateUserRoleDto,
  ) {
    // Pass current user context to service for detailed security checks
    return this.adminService.updateUserRole(
      user.userId,
      user.role,
      id,
      updateRoleDto.role === 'user' ? null : updateRoleDto.role
    );
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Enable or disable user account - Admin can disable ordinary users, Super user can disable anyone' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @AdminRequired()  // Both admins and super users can access
  async updateUserStatus(
    @User() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: AdminUpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(
      user.userId,
      user.role,
      id,
      updateStatusDto.disabled
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get basic platform statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @AdminRequired()  // Both admins and super users can access
  async getStats() {
    return this.adminService.getStats();
  }

  // ============ PAYMENT GATEWAY ENDPOINTS ============

  @Get('payment-gateways')
  @ApiOperation({ summary: 'Get all payment gateways' })
  @ApiResponse({ status: 200, description: 'Payment gateways retrieved successfully' })
  @AdminRequired()  // Both admins and super users can access
  async getPaymentGateways() {
    return this.adminService.getPaymentGateways();
  }

  @Get('payment-gateways/:id')
  @ApiOperation({ summary: 'Get payment gateway by ID' })
  @ApiResponse({ status: 200, description: 'Payment gateway retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment gateway not found' })
  @AdminRequired()  // Both admins and super users can access
  async getPaymentGateway(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.adminService.getPaymentGateway(id);
  }

  @Post('payment-gateways')
  @ApiOperation({ summary: 'Create new payment gateway' })
  @ApiResponse({ status: 201, description: 'Payment gateway created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @AdminRequired()  // Both admins and super users can access
  async createPaymentGateway(
    @Body() gatewayData: Partial<IPaymentGateway>
  ) {
    return this.adminService.createPaymentGateway(gatewayData);
  }

  @Patch('payment-gateways/:id')
  @ApiOperation({ summary: 'Update payment gateway' })
  @ApiResponse({ status: 200, description: 'Payment gateway updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment gateway not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @AdminRequired()  // Both admins and super users can access
  async updatePaymentGateway(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<IPaymentGateway>
  ) {
    return this.adminService.updatePaymentGateway(id, updateData);
  }

  @Delete('payment-gateways/:id')
  @ApiOperation({ summary: 'Delete payment gateway' })
  @ApiResponse({ status: 200, description: 'Payment gateway deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment gateway not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete gateway with transactions' })
  @AdminRequired()  // Both admins and super users can access
  async deletePaymentGateway(
    @Param('id', ParseIntPipe) id: number
  ) {
    await this.adminService.deletePaymentGateway(id);
    return { message: 'Payment gateway deleted successfully' };
  }

  @Patch('payment-gateways/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle payment gateway active status' })
  @ApiResponse({ status: 200, description: 'Payment gateway status updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment gateway not found' })
  @AdminRequired()  // Both admins and super users can access
  async togglePaymentGatewayStatus(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.adminService.togglePaymentGatewayStatus(id);
  }

  @Get('payment-gateways/:id/stats')
  @ApiOperation({ summary: 'Get payment gateway statistics' })
  @ApiResponse({ status: 200, description: 'Payment gateway statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment gateway not found' })
  @AdminRequired()  // Both admins and super users can access
  // @SuperUserRequired()  // Only super users can access example
  async getPaymentGatewayStats(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.adminService.getPaymentGatewayStats(id);
  }
}
