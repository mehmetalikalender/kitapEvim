import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) { }

  // Veritabanına yeni kitap kaydeder
  async create(bookData: Partial<Book>): Promise<Book> {
    const newBook = this.booksRepository.create(bookData);
    return this.booksRepository.save(newBook);
  }

  // Tüm kitapları getirir
  async findAll(): Promise<Book[]> {
    return this.booksRepository.find();
  }

  // ID'sine göre tek bir kitabı getirir
  async findOne(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Kitap (#${id}) sistemde bulunamadı`);
    }
    return book;
  }

  // Kitabı günceller (Stok düşme, fiyat değiştirme vs.)
  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id); // Önce kitabın varlığından emin oluyoruz

    // Gelen yeni bilgileri mevcut kitabın üzerine yazar
    Object.assign(book, updateBookDto);

    return this.booksRepository.save(book);
  }

  // Kitabı veritabanından siler
  async remove(id: string): Promise<void> {
    const book = await this.findOne(id);
    await this.booksRepository.remove(book);
  }
}