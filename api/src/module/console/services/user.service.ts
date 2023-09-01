import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { Role, User } from '@prisma/client';
import { passwordHash } from '../../../utils/auth-tool';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        username,
      },
    });
  }

  async create(username: string, password: string): Promise<User> {
    password = await passwordHash(password);
    return await this.prisma.user.create({
      data: {
        role: Role.Root,
        username,
        password,
      },
    });
  }

  async updatePassword(id: bigint, password: string): Promise<User> {
    password = await passwordHash(password);
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
      },
    });
  }
}
