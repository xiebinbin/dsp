import {
  Body,
  Controller,
  HttpException,
  Post,
  Get,
  UseInterceptors,
  Logger,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { AuthError } from 'src/utils/err_types';
import { PositionService } from '../services/position.service';
import { GuardMiddlewareRoot } from '../middlewares/guard.middleware';
import { PositionDto } from '../dto/position.dto';
@Controller('/api/admin/position')
export class PositionController {
  constructor(
    private readonly PositionService: PositionService,
  ) { }
  @Get('positionoptlist')
  @UseInterceptors(ApiResInterceptor)
  async getPosition() {
  
    return await this.PositionService.findPositions();
  }
  @Post('list')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async getList(@Body() queryParams: any) {
    const { page, limit, orderBy } = queryParams;
    return await this.PositionService.getList({
      page,
      limit,
      orderBy,
      name: queryParams.q || '',
    });
  }

  @Get(':id')
  @UseInterceptors(ApiResInterceptor)
  async getMaterial(@Param('id') id: number) {
    const userinfo = await this.PositionService.findById(BigInt(id));
    return this.convertPositionnfo(userinfo);
  }

  @Post('store')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async materialstore(@Body() data: PositionDto) {

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
    if (!res.id) {
      return false;
    }
    return true;
  }
  @Put(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async updateMaterial(
    @Param('id') id: bigint,
    @Body()
    positionDto: PositionDto
  ) {
    return await this.PositionService.updatePosition(id, positionDto);
  }
  @Delete(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async removeUser(@Param('id') id: bigint){
    return await  this.PositionService.removePosition(id);
  }
  convertPositionnfo(positon: any): PositionDto {
    return {
      id: Number(positon.id),
      name: positon.name,
      enabled: positon.enabled,
      // 类型 1 网站 2pc 软件
      type: positon.type,
      createdAt: positon.createdAt,
      updatedAt: positon.updatedAt,
      adSpecId: positon?.adSpecId ?? null,
      adMediaId: positon?.adMediaId ?? null,
      adSpec: positon?.adSpec ? {
        id: positon.adSpec.id,
        name: positon.adSpec.name,
      } : null,
      adMedia: positon?.adMedia ? {
        id: positon.adMedia.id,
        name: positon.adMedia.name,
      } : null,
    };
  }
}
