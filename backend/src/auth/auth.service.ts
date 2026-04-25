import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // 1. KAYIT OLMA (REGISTER) - Dışarıdan 'role' parametresini sildik
    async register(email: string, pass: string, firstName: string, lastName: string) {
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new BadRequestException('Bu email adresi zaten kullanımda');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(pass, saltRounds);

        const newUser = await this.usersService.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            //Dışarıdan ne gelirse gelsin KESİNLİKLE müşteri yapıyoruz
            role: UserRole.CUSTOMER,
        });

        return this.login(newUser);
    }

    // 2. GİRİŞ YAPMA (LOGIN)
    async loginOrVerify(email: string, pass: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Kullanıcı bulunamadı');
        }

        // Gelen düz parola ile veritabanındaki hash'lenmiş parolayı karşılaştır
        const isPasswordMatching = await bcrypt.compare(pass, user.password);
        if (!isPasswordMatching) {
            throw new UnauthorizedException('Hatalı parola');
        }

        return this.login(user);
    }

    // Token Üretme Yardımcı Metodu
    private login(user: any) {
        // Token'ın içine gömeceğimiz veriler (Payload)
        // Dikkat: Buraya asla şifre gibi hassas veriler koymuyoruz!
        const payload = { email: user.email, sub: user.id, role: user.role };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
            }
        };
    }
}