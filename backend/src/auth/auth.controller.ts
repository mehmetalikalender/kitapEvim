import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() body: any) {
        // Not: Normalde buraya DTO (Data Transfer Object) yazıp validasyon yaparız,
        // şimdilik test edebilmek için body'den direkt çekiyoruz.
        return this.authService.register(
            body.email,
            body.password,
            body.firstName,
            body.lastName,
        );
    }

    @Post('login')
    login(@Body() body: any) {
        return this.authService.loginOrVerify(body.email, body.password);
    }
}