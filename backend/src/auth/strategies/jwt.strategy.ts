import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            // Token'ı nerede arayacağını söylüyoruz (Authorization header'ında Bearer olarak)
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // Süresi dolmuş token'ları reddet
            secretOrKey: configService.get<string>('JWT_SECRET') || 'yedek-gizli-anahtar', // .env'deki gizli anahtarımız
        });
    }

    // Token geçerliyse bu fonksiyon çalışır. 
    // Buradan dönen obje, NestJS tarafından otomatik olarak request.user içine yerleştirilir.
    async validate(payload: any) {
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role
        };
    }
}

/*  Bu sınıf, gelen isteklerdeki (request) Header'a bakar, "Bearer Token"ı bulur, bizim gizli anahtarımızla şifresini çözer ve içindeki bilgileri sisteme sunar. */