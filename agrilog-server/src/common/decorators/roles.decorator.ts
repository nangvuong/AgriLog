import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'agrilog-shared';

export const ROLES_KEY = 'roles';
/**
 * Decorator chỉ định danh sách vai trò được phép truy cập endpoint
 * VD: @Roles(UserRole.ADMIN, UserRole.MANAGER)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
