import { Controller, Post, UseGuards } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

// Bu controller'a girebilmek için geçerli bir Token şart
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('seeder')
export class SeederController {
    constructor(private readonly seederService: SeederService) { }

    // SADECE SUPERADMIN YETKİSİ OLANLAR BU BUTONA BASABİLİR!
    @Roles(UserRole.SUPERADMIN)
    @Post('reset')
    async resetSystem() {
        return this.seederService.seedAll();
    }
}