import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Book } from 'src/books/entities/book.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Book, Order, OrderItem])],
  providers: [SeederService],
  controllers: [SeederController]
})
export class SeederModule { }
