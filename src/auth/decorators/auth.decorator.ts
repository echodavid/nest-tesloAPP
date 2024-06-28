
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { RoleProtectd } from './role-protectd.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtectd(...roles),
    UseGuards(
        AuthGuard(),
        UserRoleGuard
    ),
    )
}

