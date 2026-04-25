import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { SeederModule } from './seeder/seeder.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // GÖRSELLERİ DIŞARI AÇAN MODÜL
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // uploads klasörünü kök dizin kabul et
      serveRoot: '/uploads', // Tarayıcıdan http://localhost:3000/uploads/... şeklinde erişilecek
    }),

    //  .env dosyasını tüm projede erişilebilir kılar
    ConfigModule.forRoot({ isGlobal: true }),

    //  TypeORM bağlantısını yapılandırıyoruz
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        // Entityleri otomatik bulur
        autoLoadEntities: true,

        // geliştirme esnasında true olmalı 
        // yazılan kodlara göre tabloları otomatik oluşturur/günceller.
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    UsersModule,

    BooksModule,

    OrdersModule,

    AuthModule,

    SeederModule,
  ],
})
export class AppModule { }