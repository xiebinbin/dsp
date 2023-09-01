import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { User } from '@prisma/client';

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

  async findById(id: bigint): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        id,
      },
    });
  }
}
