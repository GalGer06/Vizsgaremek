import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from 'src/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: registerDto.email },
          { username: registerDto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    const hashedPassword = await hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
        access: false,
      },
    });

    return this.createAuthResponse(user.id, user.username, user.email, user.access);
  }

  async registerAdmin(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: registerDto.email },
          { username: registerDto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    const hashedPassword = await hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
        access: true,
      },
    });

    return this.createAuthResponse(user.id, user.username, user.email, user.access);
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: loginDto.usernameOrEmail },
          { username: loginDto.usernameOrEmail },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthResponse(user.id, user.username, user.email, user.access);
  }

  async loginAdmin(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: loginDto.usernameOrEmail },
          { username: loginDto.usernameOrEmail },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.access) {
      throw new UnauthorizedException('Admin access required');
    }

    return this.createAuthResponse(user.id, user.username, user.email, user.access);
  }

  private createAuthResponse(
    userId: number,
    username: string,
    email: string,
    access: boolean,
  ) {
    const payload: JwtPayload = {
      sub: userId,
      username,
      email,
      access,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        username,
        email,
        access,
      },
    };
  }
}
