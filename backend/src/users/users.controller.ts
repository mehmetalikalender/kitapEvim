import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from './entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';


@UseGuards(JwtAuthGuard, RolesGuard) // Bu guard'lar tüm route'larda geçerli olacak
// Bu controller'a gelen HER İSTEK önce Token ve Rol testinden geçmek zorunda
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto as any);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id); // DİKKAT: +id'deki '+' işaretini kaldırdık
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto); // + kaldırıldı
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id); // + kaldırıldı
  }
}
