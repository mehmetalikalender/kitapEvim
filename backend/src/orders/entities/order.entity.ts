import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Bir sipariş bir kullanıcıya aittir (Many-to-One)
    @ManyToOne(() => User, (user) => user.id, { eager: true })
    user: User;

    @Column('decimal', { precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.COMPLETED })
    status: OrderStatus;

    // Bir siparişin içinde birden fazla kitap/kalem olabilir (One-to-Many)
    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true, eager: true })
    items: OrderItem[];

    @CreateDateColumn()
    createdAt: Date;
}