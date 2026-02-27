import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaymentGateway } from 'src/common/interfaces/models.interface';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Capsule } from '../capsules/entities/capsule.entity';
import { PaymentGatewayService } from '../payments/services/payment-gateway.service';
import { AdminUserListQueryDto } from '../users/dto/admin-update-user.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Capsule)
    private capsuleRepository: Repository<Capsule>,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) { }

  async getUsers(query: AdminUserListQueryDto) {
    const { page = 1, limit = 20, role, status, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder: SelectQueryBuilder<User> = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.fullName',
        'user.role',
        'user.disabled',
        'user.isVerified',
        'user.isFromGoogle',
        'user.created',
        'user.updated',
      ]);

    // Apply filters
    if (role) {
      if (role === 'regular') {
        queryBuilder.andWhere('user.role IS NULL');
      } else {
        queryBuilder.andWhere('user.role = :role', { role });
      }
    }

    if (status) {
      const disabled = status === 'disabled';
      queryBuilder.andWhere('user.disabled = :disabled', { disabled });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.fullName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const users = await queryBuilder
      .orderBy('user.created', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserRole(
    currentUserId: number,
    currentUserRole: string,
    targetUserId: number,
    newRole: 'super_user' | 'admin' | null
  ) {
    // Security Check 1: User can't degrade themselves
    if (currentUserId === targetUserId) {
      throw new ForbiddenException('You cannot change your own role');
    }

    // Get the target user
    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Security Check 2: Role assignment restrictions based on current user's role
    if (currentUserRole === 'admin') {
      // Admin can only assign admin role and only to ordinary users (not super_users or other admins)
      if (newRole === 'super_user') {
        throw new ForbiddenException('Admin users cannot assign super_user role');
      }

      if (targetUser.role === 'super_user') {
        throw new ForbiddenException('Admin users cannot modify super_user accounts');
      }

      if (targetUser.role === 'admin' && targetUser.id !== currentUserId) {
        throw new ForbiddenException('Admin users cannot modify other admin accounts');
      }

      // Admin can only assign 'admin' role or remove role (set to null) from ordinary users
      if (newRole !== 'admin' && newRole !== null) {
        throw new ForbiddenException('Admin users can only assign admin role or remove roles from ordinary users');
      }
    } else if (currentUserRole === 'super_user') {
      // Super users can assign any role to any user (but not to themselves - already checked above)
      // No additional restrictions for super_user
    } else {
      throw new ForbiddenException('Insufficient privileges to assign roles');
    }

    // Security Check 3: Prevent removing super_user role if it's the last super user
    if (targetUser.role === 'super_user' && newRole !== 'super_user') {
      const superUserCount = await this.userRepository.count({
        where: { role: 'super_user' },
      });

      if (superUserCount <= 1) {
        throw new BadRequestException('Cannot remove the last super user');
      }
    }

    // Update the role
    targetUser.role = newRole;
    await this.userRepository.save(targetUser);

    return {
      message: 'User role updated successfully',
      user: {
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        fullName: targetUser.fullName,
        disabled: targetUser.disabled,
      },
    };
  }

  async updateUserStatus(
    currentUserId: number,
    currentUserRole: string,
    targetUserId: number,
    disabled: boolean
  ) {
    // Security Check 1: User can't disable themselves
    if (currentUserId === targetUserId) {
      throw new ForbiddenException('You cannot disable your own account');
    }

    // Get the target user
    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Security Check 2: Status change restrictions based on current user's role
    if (currentUserRole === 'admin') {
      // Admin can disable only ordinary users (not super_users or other admins)
      if (targetUser.role === 'super_user') {
        throw new ForbiddenException('Admin users cannot disable super_user accounts');
      }

      if (targetUser.role === 'admin') {
        throw new ForbiddenException('Admin users cannot disable other admin accounts');
      }
    } else if (currentUserRole === 'super_user') {
      // Super users can disable anyone except themselves (already checked above)
      // But let's add an extra check to prevent disabling other super users if it would leave none active
      if (disabled && targetUser.role === 'super_user') {
        const activeSuperUserCount = await this.userRepository.count({
          where: { role: 'super_user', disabled: false },
        });

        if (activeSuperUserCount <= 1) {
          throw new BadRequestException('Cannot disable the last active super user');
        }
      }
    } else {
      throw new ForbiddenException('Insufficient privileges to change user status');
    }

    // Update the status
    targetUser.disabled = disabled;
    await this.userRepository.save(targetUser);

    return {
      message: `User ${disabled ? 'disabled' : 'enabled'} successfully`,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        disabled: targetUser.disabled,
        role: targetUser.role,
        fullName: targetUser.fullName,
      },
    };
  }

  async getStats() {
    const [
      totalUsers,
      activeUsers,
      disabledUsers,
      verifiedUsers,
      adminUsers,
      superUsers,
      totalCapsules,
      activeCapsules,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { disabled: false } }),
      this.userRepository.count({ where: { disabled: true } }),
      this.userRepository.count({ where: { isVerified: true } }),
      this.userRepository.count({ where: { role: 'admin' } }),
      this.userRepository.count({ where: { role: 'super_user' } }),
      this.capsuleRepository.count(),
      this.capsuleRepository.count({ where: { deleted: null } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        disabled: disabledUsers,
        verified: verifiedUsers,
        regular: totalUsers - adminUsers - superUsers,
        admin: adminUsers,
        superUser: superUsers,
      },
      capsules: {
        total: totalCapsules,
        active: activeCapsules,
        deleted: totalCapsules - activeCapsules,
      },
      generatedAt: new Date(),
    };
  }

  // ============ PAYMENT GATEWAY ADMIN METHODS ============

  /**
   * Get all payment gateways
   */
  async getPaymentGateways() {
    return this.paymentGatewayService.getAllGateways();
  }

  /**
   * Get payment gateway by ID
   */
  async getPaymentGateway(id: number) {
    return this.paymentGatewayService.getGatewayById(id);
  }

  /**
   * Create new payment gateway
   */
  async createPaymentGateway(gatewayData: Partial<IPaymentGateway>) {
    return this.paymentGatewayService.createGateway(gatewayData);
  }

  /**
   * Update payment gateway
   */
  async updatePaymentGateway(id: number, updateData: Partial<IPaymentGateway>) {
    return this.paymentGatewayService.updateGateway(id, updateData);
  }

  /**
   * Delete payment gateway
   */
  async deletePaymentGateway(id: number) {
    return this.paymentGatewayService.deleteGateway(id);
  }

  /**
   * Toggle payment gateway status
   */
  async togglePaymentGatewayStatus(id: number) {
    return this.paymentGatewayService.toggleGatewayStatus(id);
  }

  /**
   * Get payment gateway statistics
   */
  async getPaymentGatewayStats(id: number) {
    return this.paymentGatewayService.getGatewayStats(id);
  }

  async getUserAccess(userId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {role: true, disabled: true }
    });
    return user;
  }
}
