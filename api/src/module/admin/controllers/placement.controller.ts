import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Post,
  Put,
  Res,
  Delete,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { PlacementService } from '../services/placement.service';
import { MediaRelationService } from '../services/mediarelation.service';
import { PlacementDto } from '../dto/placement.dto';
import { AuthError } from 'src/utils/err_types';
import { Request } from 'express';
import { AdvService } from '../services/adv.service';
import { GuardMiddlewareRoot } from '../middlewares/guard.middleware';

@Controller('/api/admin/placement/')
@UseInterceptors(ApiResInterceptor)
export class PlacementController {
  constructor(
    private readonly PlacementService: PlacementService,
    private readonly MediaRelationService: MediaRelationService,
    private readonly AdvService: AdvService,
  ) {}
  private readonly logger = new Logger(PlacementController.name);
  @Post('optlist/:id')
  @UseInterceptors(ApiResInterceptor)
  async getOptionList(@Param('id') id: number) {
    try {
      const placementinfo = await this.PlacementService.findById(BigInt(id));
      //   return response.send(result);
      const result = await this.MediaRelationService.findMediaRelations(
        placementinfo.id,
      );

      return result;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('list')
  @UseInterceptors(ApiResInterceptor)
  async getList(
    @Req() req: Request,
    @Body() queryParams: any,
    @Res() response,
  ) {
    console.log('queryParams', queryParams);
    // console.log('placement requser', req.user);
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      if (req.user.role != 'Root' && req.user.role != 'Operator') {
        extra.agentid = req.user.id;
      }
      const result = await this.PlacementService.getList({
        page,
        limit,
        orderBy,
        name: queryParams.q || '',
        advertiserId: extra.advid || '', //广告主
        userId: extra.agentid || '', //代理商
        materialname: extra.materialname || '',
      });
      console.log('placement result', result);
      const responseData = {
        data: { data: result.data, total: result.total },
      };
      // return result;
      return response.send(responseData);
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Get(':id')
  @UseInterceptors(ApiResInterceptor)
  async getUser(@Param('id') id: number, @Res() response) {
    try {
      const placementinfo = await this.PlacementService.findById(BigInt(id));
      console.log('placementinfo', placementinfo);
      const convertdata = this.convertPlacementInfo(placementinfo);
      console.log('convertdata', convertdata);
      const responseData = {
        data: convertdata,
        code: 200,
      };
      return response.send(responseData);
      // return result;
      console.log('responseData', responseData);

      // return response.send(responseData);
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('store')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async userstore(@Body() data: PlacementDto) {
    console.log('data,data', data);

    try {
      const name = await this.PlacementService.findByname(data.name);
      if (name) {
        throw new HttpException(
          AuthError.PLACEMENTNAME_IS_SAME.message,
          AuthError.PLACEMENTNAME_IS_SAME.code,
        );
      }
      const advres = await this.AdvService.findById(data.advertiserId);
      if (advres.wallet == null || advres.wallet.balance < data.budget) {
        throw new HttpException(
          AuthError.BALANCE_NOTENOUGH.message,
          AuthError.BALANCE_NOTENOUGH.code,
        );
      }
      const res = await this.PlacementService.createPlacement(data);
      console.log('placement res', res);
      const mediarelation = data.medias.map((mediaId) => ({
        mediaId: mediaId,
        placementId: res.id, // 这里需要修改为正确的获取 AdPlacement 的方式
        enabled: true,
      }));
      await this.MediaRelationService.createMediaRelation(mediarelation);
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
  @UseInterceptors(ApiResInterceptor)
  async updatePlacement(
    @Param('id') id: bigint,
    @Body()
    data: PlacementDto,
    @Res() response,
  ) {
    console.log('data', data);
    const advres = await this.AdvService.findById(data.advertiserId);
    if (advres.wallet == null || advres.wallet.balance < data.budget) {
      throw new HttpException(
        AuthError.BALANCE_NOTENOUGH.message,
        AuthError.BALANCE_NOTENOUGH.code,
      );
    }
    const result = this.PlacementService.updatePlacement(id, data);

    return response.send(result);
  }
  @Put('pending/:id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  async updateEnabled(
    @Param('id') id: bigint,
    @Body()
    data: { enabled: boolean },
    @Res() response,
  ) {
    console.log('data', data);
    const result = this.PlacementService.updateEnabled(id, data.enabled);

    return response.send(result);
  }
  @Delete(':id')
  @UseGuards(GuardMiddlewareRoot) // 使用 RootGuard 守卫
  @UseInterceptors(ApiResInterceptor)
  async removeUser(@Param('id') id: bigint): Promise<boolean> {
    console.log('id', id);
    return this.PlacementService.removePlacement(id);
  }
  @Get('detail/:id')
  @UseInterceptors(ApiResInterceptor)
  async getDetail(@Param('id') id: number, @Res() response) {
    try {
      const userinfo = await this.PlacementService.findById(BigInt(id));
      const res = this.convertPlacementInfo(userinfo);
      console.log('convertPlacementInfo', res);
      const responseData = {
        data: res,
        total: res.total,
      };
      return response.send(responseData);

      return res;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }

  @Post('listbyadvertiser')
  @UseInterceptors(ApiResInterceptor)
  async getListByAdvertiser(
    @Req() req: Request,
    @Body() queryParams: any,
    @Res() response,
  ) {
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      console.log('req.user.id', req.user.id);
      let Advinfo;
      if (req.user.role != 'Root' && req.user.role != 'Operator') {
        Advinfo = await this.AdvService.findById(BigInt(req.user.id));
        if (!Advinfo) {
          throw new HttpException(
            AuthError.ADV_NOT_FOUND.message,
            AuthError.ADV_NOT_FOUND.code,
          );
        }
      }

      const result = await this.PlacementService.getList({
        page,
        limit,
        orderBy,
        name: queryParams.q || '',
        role: '',
        advertiserId: Advinfo?.id || '',
        userId: '',
        materialname: extra.materialname || '',
      });
      const responseData = {
        data: result,
        total: result.total,
      };
      return response.send(responseData);
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  convertPlacementInfo(placement: any): any {
    const newPlacement = { ...placement };
    newPlacement.id = Number(placement.id);
    newPlacement.advertiserId = Number(placement.advertiserId);
    newPlacement.adMaterialId = Number(placement.adMaterialId);
    newPlacement.budget = Number(placement.budget);
    newPlacement.usedBudget = Number(placement.usedBudget);
    newPlacement.displayCount = Number(placement.displayCount);
    newPlacement.clickCount = Number(placement.clickCount);
    newPlacement.adMediaRelations = placement.adMediaRelations.map((val) => ({
      mediaId: Number(val.mediaId),
      mediaName: val.admedia.name,
    }));
    newPlacement.advertiser.id = Number(placement.advertiser.id);
    newPlacement.advertiser.user.id = Number(placement.advertiser.user.id);

    return newPlacement;
  }
}