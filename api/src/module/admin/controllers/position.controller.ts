import {
  Body,
  Controller,
  HttpException,
  Post,
  Get,
  Req,
  UseInterceptors,
  Logger,
  Res,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { AuthError } from 'src/utils/err_types';
import { Request } from 'express';
import { PositionService } from '../services/position.service';
import { mediaDto } from '../dto/media.dto';
import { GuardMiddlewareRoot } from '../middlewares/guard.middleware';
import { PositionDto } from '../dto/position.dto';

@Controller('/api/admin/position')
export class PositionController {
  constructor(private readonly PositionService: PositionService) {}
  private readonly logger = new Logger(PositionController.name);
  @Get('positionoptlist')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getPosition() {
    try {
      const mediainfo = await this.PositionService.findPositions();
      console.log(mediainfo);
      // const userInfoconvert = this.convertReturnInfo(userinfo);
      return mediainfo;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('list')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getList(@Req() req: Request, @Body() queryParams: any) {
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      const result = await this.PositionService.getList({
        page,
        limit,
        orderBy,
        name: queryParams.q || '',
      });
      return result;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }

  @Get(':id')
  @UseInterceptors(ApiResInterceptor)
  async getMaterial(@Param('id') id: number) {
    try {
      const userinfo = await this.PositionService.findById(BigInt(id));
      const res = this.convertPositionnfo(userinfo);
      console.log('getresult', res);

      return res;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }

  @Post('store')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async materialstore(@Body() data: PositionDto) {
    const name = data.name;

    try {
      const positionname = await this.PositionService.findByUsername(
        data.name,
        data.type,
      );

      if (positionname) {
        throw new HttpException(
          AuthError.Position_IS_SAME.message,
          AuthError.Position_IS_SAME.code,
        );
      }
      const res = await this.PositionService.createPosition(data);
      // console.log('res', res);
      if (!res.id) {
        return false;
      }
      return true;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Put(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async updateMaterial(
    @Param('id') id: bigint,
    @Body()
    positionDto: PositionDto,
    @Res() response,
  ) {
    console.log('materialDto', mediaDto);
    const result = this.PositionService.updatePosition(id, positionDto);

    return response.send(result);
  }
  @Delete(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async removeUser(@Param('id') id: bigint): Promise<boolean> {
    console.log('id', id);
    return this.PositionService.removePosition(id);
  }
  convertPositionnfo(positon: any): any {
    // Make a shallow copy of the user object

    const positonDto: PositionDto = {
      id: Number(positon.id),
      name: positon.name,
      enabled: positon.enabled,
      // 类型 1 网站 2pc 软件
      type: positon.type,
      createdAt: positon.createdAt,
      updatedAt: positon.updatedAt,
    };

    return positonDto;
  }
}