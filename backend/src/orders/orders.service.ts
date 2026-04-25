import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Book } from '../books/entities/book.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Book) private booksRepository: Repository<Book>,
  ) { }

  // YENİ VE HATASIZ CREATE METODU
  async create(userId: string, createOrderData: any): Promise<Order> {
    const { items } = createOrderData;
    let totalAmount = 0;
    const processedItems: { book: Book; quantity: number; price: number }[] = [];

    // 1. AŞAMA: Kitapları bul, stoğu kontrol et ve düş
    for (const item of items) {
      const book = await this.booksRepository.findOne({ where: { id: item.bookId } });

      // TS18047 HATA ÇÖZÜMÜ: Kitabın null olma ihtimalini kesin olarak eliyoruz.
      if (!book) {
        throw new NotFoundException(`Kitap bulunamadı: ${item.bookId}`);
      }

      // Stok kontrolü
      if (book.stock < item.quantity) {
        throw new BadRequestException(`"${book.title}" için yeterli stok yok. Kalan: ${book.stock}`);
      }

      totalAmount += Number(book.price) * item.quantity;

      // Stoğu düşür ve kaydet (book artık kesin olarak Book tipinde)
      book.stock -= item.quantity;
      await this.booksRepository.save(book);

      // İşlenen kitabı hafızada tut
      processedItems.push({
        book: book,
        quantity: item.quantity,
        price: book.price // Eğer OrderItem entity'sinde fiyat değişkenin adı farklıysa (örn: priceAtPurchase) burayı düzeltmelisin.
      });
    }

    // 2. AŞAMA: Ana siparişi oluştur
    // STATUS HATA ÇÖZÜMÜ: Düz metin yerine OrderStatus.COMPLETED enum'u kullanıldı.
    const newOrder = this.ordersRepository.create({
      user: { id: userId },
      totalAmount: totalAmount,
      status: OrderStatus.COMPLETED,
    });

    const savedOrder = await this.ordersRepository.save(newOrder);

    // 3. AŞAMA: Sipariş kalemlerini (OrderItems) kaydet
    for (const pItem of processedItems) {
      const orderItem = this.orderItemsRepository.create({
        order: savedOrder,
        book: pItem.book,
        quantity: pItem.quantity,
        priceAtPurchase: pItem.price, // SADECE BU SATIR DEĞİŞTİ (price yerine priceAtPurchase yazıldı)
      } as any);

      await this.orderItemsRepository.save(orderItem);
    }

    // 4. AŞAMA: Oluşturulan siparişi tüm ilişkileriyle birlikte geri dön
    return this.findOne(savedOrder.id, { role: UserRole.ADMIN } as any);
  }

  // --- DİĞER METOTLARIN (Aynen korundu) ---

  async findAll(currentUser: any): Promise<Order[]> {
    if (currentUser.role === UserRole.CUSTOMER) {
      return this.ordersRepository.find({
        where: { user: { id: currentUser.id } },
        relations: ['items', 'items.book']
      });
    }
    return this.ordersRepository.find({ relations: ['user', 'items', 'items.book'] });
  }

  async findOne(id: string, currentUser: any): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.book']
    });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');

    if (currentUser.role === UserRole.CUSTOMER && order.user.id !== currentUser.id) {
      throw new BadRequestException('Bu siparişi görüntüleme yetkiniz yok');
    }

    return order;
  }

  async update(id: string, updateOrderDto: any): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');

    Object.assign(order, updateOrderDto);
    return this.ordersRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (order) {
      await this.ordersRepository.remove(order);
    }
  }

  async getMonthlySales() {
    const sales = await this.ordersRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'Mon')", 'month')
      .addSelect("SUM(order.totalAmount)", 'total')
      .where("order.status = :status", { status: 'COMPLETED' })
      .groupBy("TO_CHAR(order.createdAt, 'Mon')")
      .getRawMany();

    const monthMap: any = {
      'Jan': 'Oca', 'Feb': 'Şub', 'Mar': 'Mar', 'Apr': 'Nis',
      'May': 'May', 'Jun': 'Haz', 'Jul': 'Tem', 'Aug': 'Ağu',
      'Sep': 'Eyl', 'Oct': 'Eki', 'Nov': 'Kas', 'Dec': 'Ara'
    };

    return sales.map(s => ({
      name: monthMap[s.month] || s.month,
      satis: parseFloat(s.total)
    }));
  }
}