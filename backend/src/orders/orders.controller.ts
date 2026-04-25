import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

// Sipariş işlemleri için HERKES giriş yapmış (Token almış) olmak zorunda
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(
    @Req() req: any,
    @Body() body: any // Frontend'den { items: [...] } verisi gelir
  ) {
    // Artık createOrder yerine daha kapsamlı olan 'create' metodunu çağırıyoruz
    return this.ordersService.create(req.user.id, body);
  }

  // HERKES (Giriş yapmış olan) sipariş oluşturabilir
  @Post()
  create(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    // req.user.id'yi token'dan alıp servise gönderiyoruz ki siparişi ona bağlayalım
    return this.ordersService.create(req.user.id, createOrderDto as any);
  }

  // HERKES kendi siparişini, YÖNETİCİLER hepsini görebilir
  @Get()
  findAll(@Req() req: any) {
    return this.ordersService.findAll(req.user);
  }

  // Sipariş detayı görüntüleme
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.findOne(id, req.user); // '+' kaldırıldı
  }

  // SADECE YÖNETİCİLER sipariş durumunu (Kargolandı vs.) güncelleyebilir
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto); // '+' kaldırıldı
  }

  // SADECE YÖNETİCİLER sipariş silebilir
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id); // '+' kaldırıldı
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get('stats/monthly-sales')
  getMonthlySales() {
    return this.ordersService.getMonthlySales();
  }

}