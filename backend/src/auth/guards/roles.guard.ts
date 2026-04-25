import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Metodun üzerindeki @Roles() etiketinden gerekli rolleri okuyoruz
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Eğer metotta @Roles() etiketi yoksa, herkes girebilir (serbest bölge)
        if (!requiredRoles) {
            return true;
        }

        // İsteği (request) ve içindeki kullanıcıyı alıyoruz (JwtStrategy bunu doldurmuştu)
        const { user } = context.switchToHttp().getRequest();

        // Eğer token yoksa veya bozuksa yasakla
        if (!user) {
            return false;
        }

        // SUPERADMIN her yere girebilsin diye ufak bir "Tanrı Modu" arka kapısı bırakıyoruz :)
        if (user.role === UserRole.SUPERADMIN) {
            return true;
        }

        // Kullanıcının rolü, metodun gerektirdiği rollerden biriyle eşleşiyorsa izin ver
        return requiredRoles.some((role) => user.role?.includes(role));
    }
}