import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

// İçine aldığı rolleri 'roles' adlı bir meta veri (metadata) olarak metoda yapıştırır.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/*  Bu dekoratör, bir route handler'ın (controller içindeki metodun) hangi rollere sahip kullanıcılar tarafından erişilebileceğini belirtmek için kullanılır. Örneğin, @Roles(UserRole.ADMIN) dediğimizde, bu route'a sadece ADMIN rolüne sahip kullanıcılar erişebilir demektir. */