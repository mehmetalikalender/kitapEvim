import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { goldenBooks } from './golden-data'; // goldenUsers importu artık gerekli değildir

@Injectable()
export class SeederService {
    private readonly logger = new Logger(SeederService.name);

    constructor(
        private dataSource: DataSource,
        @InjectRepository(User) private usersRepo: Repository<User>,
        @InjectRepository(Book) private booksRepo: Repository<Book>,
        @InjectRepository(Order) private ordersRepo: Repository<Order>,
        @InjectRepository(OrderItem) private orderItemsRepo: Repository<OrderItem>,
    ) { }

    async seedAll() {
        this.logger.log('Sıfırlama işlemi (Kısmi Golden State) başlıyor...');

        // 1. AŞAMA: KISMİ TEMİZLİK (TRUNCATE)
        // DİKKAT: 'users' tablosu çıkarıldı. Böylece mevcut hesaplar ve oturumlar korunur.
        await this.dataSource.query(
            `TRUNCATE TABLE books, orders, order_items CASCADE;`
        );
        this.logger.log('1. Kitap ve sipariş veritabanı başarıyla temizlendi (Kullanıcılar korundu).');

        // 2. AŞAMA: SİMÜLASYON İÇİN MÜŞTERİ KONTROLÜ
        // Siparişlerin bağlanacağı bir müşteri hesabı aranır. Bulunamazsa simülasyonun çökmemesi için varsayılan bir müşteri oluşturulur.
        let customer = await this.usersRepo.findOne({ where: { role: UserRole.CUSTOMER } });
        if (!customer) {
            const hashedPassword = await bcrypt.hash('Password123!', 10);
            customer = this.usersRepo.create({
                email: 'customer@clone.com',
                password: hashedPassword,
                firstName: 'Sadık',
                lastName: 'Müşteri',
                role: UserRole.CUSTOMER,
            });
            await this.usersRepo.save(customer);
            this.logger.log('2. Simülasyon için örnek müşteri hesabı oluşturuldu.');
        } else {
            this.logger.log('2. Mevcut müşteri hesabı simülasyon için seçildi.');
        }

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
            const totalAmount = Number(randomBook.price) * quantity;

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
            message: 'Sistem başarıyla Golden State ayarlarına döndürüldü. Mevcut oturumlar korundu.',
        };
    }
}