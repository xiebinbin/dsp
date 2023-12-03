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
import { AdvService } from '../services/adv.service';
import { Request } from 'express';
import { AdvDto } from '../dto/adv.dto';
import {
  RolesGuard,
  Roles,
} from '../middlewares/guard.middleware';

@Controller('/api/admin/advertiser')
export class AdvController {
  constructor(private readonly AdvService: AdvService) { }
  @Post('optlist')
  @UseInterceptors(ApiResInterceptor)
  async getOptionList(@Req() req: Request, @Body() queryParams: any) {
    const { page, limit, orderBy } = queryParams;
    return await this.AdvService.findAdvertisers({
      page,
      limit,
      orderBy,
      // nickname: queryParams.nickname || '',
      username: queryParams.q || '',
      role: req.user.role,
      userId: req.user.id,
    });
  }
  @Post('reportagentlist')
  @UseInterceptors(ApiResInterceptor)
  async getAgentByOperator(@Req() req: Request, @Body() queryParams: any) {

    let operatorId;
    if (req.user.role == 'Operator') {
      operatorId = req.user.id;
    }
    const advs = await this.AdvService.findByOperator(operatorId);

    const result = advs.map((adv) => ({
      id: adv.user.id,
      name: adv.user.nickname,
    }));
    return Array.from(
      new Set(result.map((item) => item.id)),
    ).map((id) => {
      return result.find((item) => item.id === id);
    });
  }
  @Post('list')
  @Roles(['Root', 'Agent'])
  @UseGuards(RolesGuard)
  @UseInterceptors(ApiResInterceptor)
  async getList(@Req() req: Request, @Body() queryParams: any) {
    const { page, limit, orderBy, extra } = queryParams;
    return await this.AdvService.getList({
      page,
      limit,
      orderBy,
      username: queryParams.q || '',
      role: queryParams.extra.role,
      userId: req.user.id,
      comp: extra.comp,
    });
  }
  @Get(':id')
  @Roles(['Root', 'Agent'])
  @UseGuards(RolesGuard)
  @UseInterceptors(ApiResInterceptor)
  async getUser(@Param('id') id: number) {
    const userinfo = await this.AdvService.findById(BigInt(id));
    if (userinfo.wallet == null) {
      userinfo.wallet = {
        balance: 0n,
      };
    }
    return this.convertAdvInfo(userinfo);
  }
  @Post('store')
  @Roles(['Root'])
  @UseGuards(RolesGuard)
  @UseInterceptors(ApiResInterceptor)
  async userstore(@Body() data: AdvDto) {
    const res = await this.AdvService.createUser(data);
    if (!res.id) {
      return false;
    }
    return true;
  }
  @Put(':id')
  @Roles(['Root'])
  @UseGuards(RolesGuard)
  async updateUser(
    @Param('id') id: bigint,
    @Body()
    advDto: AdvDto,
  ) {
    return await this.AdvService.updateUser(id, advDto);
  }
  @Delete(':id')
  @UseInterceptors(ApiResInterceptor)
  async removeUser(@Param('id') id: bigint) {
    return await this.AdvService.removeUser(id);
  }
  convertAdvInfo(adv: any): AdvDto {
    return {
      id: Number(adv.id),
      companyName: adv.companyName,
      domainName: adv.domainName,
      username: adv.username,
      password: '',
      wallet: { balance: adv.wallet.balance },
      userId: Number(adv.userId),
      operatorId: adv?.operator ? Number(adv.operatorId) : null,
      updatedAt: null,
      enabled: adv.enabled,
      user: { id: Number(adv.user.id), name: adv.user.nickname }, // 使用对象字面量设置 user 属性的值
      operator: adv?.operator
        ? { id: Number(adv.operator.id), name: adv.operator.nickname }
        : null,
    };
  }
}
