import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { PrismaClient, Role, User } from '@prisma/client';
import { passwordHash } from 'src/utils/auth-tool';
import { UserDto } from '../dto/user.dto';
import { AuthError } from 'src/utils/err_types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaClient) {}

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
  async updateUser(id: bigint, userDto: UserDto) {
    console.log('id', id, 'updatid', userDto.id);
    if (userDto.password && userDto.password != '......') {
      userDto.password = await passwordHash(userDto.password);
    } else {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { password: true },
      });

      userDto.password = user.password;
    }
    console.log('userDto', userDto);
    try {
      const res = await this.prisma.user.update({
        where: { id },
        data: {
          nickname: userDto.nickname,
          role: this.mapStringToRole(userDto.role),
          enabled: userDto.enabled,
          password: userDto.password,
          updatedAt: new Date(),
        },
      });
      console.log('res', res);
      return true;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
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
  async getList(queryParams: any) {
    const { page, limit, username, orderBy } = queryParams;
    const selectFields = {
      id: true,
      username: true,
      nickname: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      enabled: true,
    };
    const where: any = {};
    if (username) {
      where.username = username;
    }
    if (!username) {
      const total = await this.prisma.user.count({
        where,
      });
      const allUsers = await this.prisma.user.findMany({
        // 这里可以添加其他查询条件
        select: selectFields, // 指定需要的字段

        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderBy,
      });
      const allusersWithNumberID = allUsers.map((allUsers) => {
        return {
          ...allUsers,
          id: Number(allUsers.id),
        };
      });
      return {
        data: allusersWithNumberID,
        total,
      };
    }

    const total = await this.prisma.user.count({
      where,
    });

    const users = await this.prisma.user.findMany({
      where,
      select: selectFields, // 指定需要的字段

      skip: (page - 1) * limit,
      take: limit,
      orderBy: orderBy,
    });
    const usersWithNumberID = users.map((user) => {
      return {
        ...user,
        id: Number(user.id),
      };
    });
    return {
      data: usersWithNumberID,
      total,
    };
  }
  async createUser(userDto: UserDto): Promise<User> {
    try {
      userDto.password = await passwordHash(userDto.password);
      const { nickname, username, password, role, enabled } = userDto;

      return await this.prisma.user.create({
        data: {
          nickname,
          username,
          password,
          role: this.mapStringToRole(role),
          enabled,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      throw new HttpException(error.message, error.code);
    }
  }
  async removeUser(id: bigint): Promise<boolean> {
    // 查询要删除的用户
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw AuthError.USER_NOT_FOUND;
    }

    // 执行删除操作
    await this.prisma.user.delete({ where: { id } });

    return true;
  }
  mapStringToRole(roleString: string): Role | undefined {
    switch (roleString) {
      case 'Root':
        return Role.Root;
      case 'Operator':
        return Role.Operator;
      case 'Agent':
        return Role.Agent;
      default:
        return Role.Agent;
    }
  }
}
