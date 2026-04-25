import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) { }

  // SADECE YÖNETİCİLER (Kitap Ekleme)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Post()
  // RESİM YÜKLEME KESİCİSİ (Interceptor)
  @UseInterceptors(FileInterceptor('coverImage', {
    storage: diskStorage({
      destination: './uploads/covers', // Resimlerin kaydedileceği klasör
      filename: (req, file, cb) => {
        // Resmin ismini benzersiz yapıyoruz ki aynı isimde resimler çakışmasın
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  create(@Body() createBookDto: any, @UploadedFile() file: Express.Multer.File) {
    // Eğer formdan bir dosya geldiyse, DTO içindeki coverImageUrl alanına bu yerel linki yaz
    if (file) {
      createBookDto.coverImageUrl = `/uploads/covers/${file.filename}`;
    }
    return this.booksService.create(createBookDto);
  }

  // HERKESE AÇIK (Vitrin - Tüm kitapları listeleme)
  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  // HERKESE AÇIK (Kitap Detayı görüntüleme)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id); // '+' işaretinden kurtulduk
  }

  // SADECE YÖNETİCİLER (Kitap Güncelleme - Fiyat/Stok vs.)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('coverImage', {
    storage: diskStorage({
      destination: './uploads/covers',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  update(@Param('id') id: string, @Body() updateBookDto: any, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      updateBookDto.coverImageUrl = `/uploads/covers/${file.filename}`;
    }
    return this.booksService.update(id, updateBookDto);
  }

  // SADECE YÖNETİCİLER (Kitap Silme)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(id); // '+' kaldırıldı
  }
}