import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from "./entities/book.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Book])], // Book entitysini TypeORM modülüne ekliyoruz
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule { }
