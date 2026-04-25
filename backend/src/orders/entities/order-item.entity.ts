import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Book } from '../../books/entities/book.entity';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Bu kalem hangi siparişe ait?
    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    order: Order;

    // Bu kalem hangi kitap?
    @ManyToOne(() => Book, {
        eager: true,
        onDelete: 'CASCADE',
    })
    book: Book;

    @Column({ type: 'int' })
    quantity: number;

    // Satın alındığı andaki fiyat (kitabın fiyatı sonradan değişse bile burası sabit kalmalı)
    @Column('decimal', { precision: 10, scale: 2 })
    priceAtPurchase: number;
}