import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  // SUNUCU HER BAŞLADIĞINDA OTOMATİK ÇALIŞAN METOT
  async onApplicationBootstrap() {
    // Veritabanında herhangi bir SUPERADMIN var mı diye bak
    const superAdminExists = await this.usersRepository.findOne({
      where: { role: UserRole.SUPERADMIN }
    });

    // Eğer yoksa, ilk kurucuyu otomatik yarat
    if (!superAdminExists) {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const defaultAdmin = this.usersRepository.create({
        email: 'kurucu@clone.com',
        password: hashedPassword,
        firstName: 'Mehmet Ali',
        lastName: 'Kalender',
        role: UserRole.SUPERADMIN,
      });

      await this.usersRepository.save(defaultAdmin);
      this.logger.log('Sistemde SuperAdmin bulunamadı. Varsayılan kurucu hesap oluşturuldu!');
      this.logger.log('Email: kurucu@clone.com | Şifre: Password123!');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  // Tüm kullanıcıları getirir (Şifreleri dışarıda bırakmak güvenlik için iyidir ama şimdilik basit tutuyoruz)
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // ID'ye göre tek bir kullanıcı bulur
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Kullanıcı (#${id}) bulunamadı`);
    }
    return user;
  }

  // Kullanıcıyı günceller
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id); // Önce kullanıcının var olduğundan emin ol

    // Gelen yeni verileri eski kullanıcının üzerine yazar
    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  // Kullanıcıyı siler
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}