import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as Bcrypt from 'bcrypt';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async signup(dto: AuthDto) {
    const hash = await Bcrypt.hashSync(dto.password, 10);

    const user = await this.userService.create({
      email: dto.email,
      password: hash,
    });
    return this.userService.findOne(user.id);
  }

  async signIn(id: string, email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(id);
    if (user.email !== email) {
      throw new UnauthorizedException('Email ou senha invalidos');
    }
    const isPasswordValid = await Bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha invalidos');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }
}
