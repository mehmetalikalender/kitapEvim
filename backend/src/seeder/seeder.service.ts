import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { goldenUsers, goldenBooks } from './golden-data';

@Injectable()
export class SeederService {
    // Terminalde aşamaları güzelce görebilmek için Logger ekliyoruz
    private readonly logger = new Logger(SeederService.name);

    constructor(
        private dataSource: DataSource, // Raw SQL (TRUNCATE) çalıştırmak için
        @InjectRepository(User) private usersRepo: Repository<User>,
        @InjectRepository(Book) private booksRepo: Repository<Book>,
        @InjectRepository(Order) private ordersRepo: Repository<Order>,
        @InjectRepository(OrderItem) private orderItemsRepo: Repository<OrderItem>,
    ) { }

    async seedAll() {
        this.logger.log('Sıfırlama işlemi (Golden State) başlıyor...');

        // 1. AŞAMA: BÜYÜK TEMİZLİK (TRUNCATE)
        // CASCADE sayesinde tablolar arasındaki kancalar (foreign keys) koparılır ve her şey tertemiz silinir.
        await this.dataSource.query(
            `TRUNCATE TABLE users, books, orders, order_items CASCADE;`
        );
        this.logger.log('1. Veritabanı başarıyla temizlendi.');

        // 2. AŞAMA: ALTIN KULLANICILARI EKLEME
        const savedUsers: User[] = [];
        for (const userData of goldenUsers) {
            // Şifreleri açık bırakamayız, bcrypt ile hash'liyoruz
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = this.usersRepo.create({ ...userData, password: hashedPassword });
            savedUsers.push(await this.usersRepo.save(user));
        }
        this.logger.log('2. Altın Kullanıcılar (SuperAdmin, Admin, Customer) eklendi.');

        // Sipariş simülasyonunda kullanmak için müşteriyi seçelim
        const customer = savedUsers.find(u => u.email === 'customer@clone.com');

        // 3. AŞAMA: VİTRİNİ (KİTAPLARI) DOLDURMA
        const savedBooks: Book[] = [];
        for (const bookData of goldenBooks) {
            const book = this.booksRepo.create(bookData);
            savedBooks.push(await this.booksRepo.save(book));
        }
        this.logger.log('3. Altın Kitaplar vitrine yerleştirildi.');

        // 4. AŞAMA: GEÇMİŞ SATIŞ SİMÜLASYONU (Grafik için)
        for (let i = 0; i < 80; i++) {
            const randomBook = savedBooks[Math.floor(Math.random() * savedBooks.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const totalAmount = randomBook.price * quantity;

            // Son 6 ay içine homojen dağılması için rastgele bir tarih atanmaktadır
            const pastDate = new Date();
            const randomMonthOffset = Math.floor(Math.random() * 6);
            pastDate.setMonth(pastDate.getMonth() - randomMonthOffset);
            pastDate.setDate(Math.floor(Math.random() * 28) + 1);

            const order = this.ordersRepo.create({
                user: customer,
                totalAmount: totalAmount,
                status: OrderStatus.COMPLETED,
                createdAt: pastDate,
            });
            const savedOrder = await this.ordersRepo.save(order);

            const orderItem = this.orderItemsRepo.create({
                order: savedOrder,
                book: randomBook,
                quantity: quantity,
                priceAtPurchase: randomBook.price,
            });
            await this.orderItemsRepo.save(orderItem);
        }
        this.logger.log('4. Geçmiş sipariş simülasyonu tamamlandı.');

        return {
            success: true,
            message: 'Sistem başarıyla Golden State (Altın Durum) ayarlarına döndürüldü!',
            note: 'SuperAdmin, Admin ve Customer hesapları için şifre: Password123!'
        };
    }
}