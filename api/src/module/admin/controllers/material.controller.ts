import {
  Body,
  Controller,
  HttpException,
  Post,
  Get,
  Req,
  UseInterceptors,
  Logger,
  Inject,
  Res,
  Param,
  Put,
  ValidationPipe,
  Delete,
} from '@nestjs/common';
import { ApiResInterceptor } from '../interceptors/api-res.interceptor';
import { MaterialService } from '../services/material.service';
import { UserDto } from '../dto/user.dto';
import { AuthError } from 'src/utils/err_types';
import { Request } from 'express';
import { AdvDto } from '../dto/adv.dto';
import { MaterialDto } from '../dto/material.dto';
import { AdvService } from '../services/adv.service';
import { FileService } from '../services/file.service';
import { FileDto } from '../dto/file.dto';

@Controller('/api/admin/material')
export class MaterialController {
  constructor(
    private readonly MaterialService: MaterialService,
    private readonly AdvService: AdvService,
  ) {}
  private readonly logger = new Logger(MaterialController.name);

  @Post('list')
  @UseInterceptors(ApiResInterceptor)
  async getList(@Req() req: Request, @Body() queryParams: any) {
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      if (req.user.role != 'Root' && req.user.role != 'Operator') {
        extra.agentid = req.user.id;
      }
      const result = await this.MaterialService.getList({
        page,
        limit,
        orderBy,
        name: queryParams.q || '',
        role: extra.role,
        advertiserId: extra.advid,
      });
      return result;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('optlist')
  @UseInterceptors(ApiResInterceptor)
  async getOptionList(@Req() req: Request, @Body() queryParams: any) {
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      if (req.user.role != 'Root' && req.user.role != 'Operator') {
        extra.agentid = req.user.id;
      }
      const result = await this.MaterialService.getList({
        page,
        limit,
        orderBy,
        advertiserId: queryParams.q || '',
      });
      const resultopt = result.data.map((res) => ({
        id: res.id,
        name: res.name,
        advertiserId: res.advertiserId,
      }));
      console.log(resultopt);
      return { data: resultopt };
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('listbyadvertiser')
  @UseInterceptors(ApiResInterceptor)
  async getListByAdvertiser(@Req() req: Request, @Body() queryParams: any) {
    const { page, limit, q, filters, orderBy, extra } = queryParams;
    try {
      console.log('req.user.id', req.user.id);
      let Advinfo; // 将 Advinfo 的定义移到方法作用域之外

      if (req.user.role != 'Root' && req.user.role != 'Operator') {
        Advinfo = await this.AdvService.findById(BigInt(req.user.id));
        if (!Advinfo) {
          throw new HttpException(
            AuthError.ADV_NOT_FOUND.message,
            AuthError.ADV_NOT_FOUND.code,
          );
        }
      }

      const result = await this.MaterialService.getList({
        page,
        limit,
        orderBy,
        name: queryParams.q || '',
        role: '',
        advertiserId: Advinfo?.id || '',
        userId: '',
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
      const userinfo = await this.MaterialService.findById(BigInt(id));
      const res = this.convertAdvInfo(userinfo);
      console.log('getresult', res);

      return res;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Get('detail/:id')
  @UseInterceptors(ApiResInterceptor)
  async getDetail(@Param('id') id: number) {
    try {
      const userinfo = await this.MaterialService.findById(BigInt(id));
      const res = this.convertAgentInfo(userinfo);
      console.log('getagentresult', res);

      return res;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, e.status);
    }
  }
  @Post('store')
  @UseInterceptors(ApiResInterceptor)
  async materialstore(@Body() data: MaterialDto) {
    const name = data.name;

    try {
      const materialname = await this.MaterialService.findByUsername(data.name);

      if (materialname) {
        throw new HttpException(
          AuthError.MaterialName_IS_SAME.message,
          AuthError.MaterialName_IS_SAME.code,
        );
      }
      const Advinfo = await this.AdvService.findById(BigInt(data.advertiserId));
      if (!Advinfo) {
        throw new HttpException(
          AuthError.ADV_NOT_FOUND.message,
          AuthError.ADV_NOT_FOUND.code,
        );
      }
      const res = await this.MaterialService.createMaterial(data);
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
  @UseInterceptors(ApiResInterceptor)
  async updateMaterial(
    @Param('id') id: bigint,
    @Body()
    materialDto: MaterialDto,
    @Res() response,
  ) {
    console.log('materialDto', materialDto);
    const result = this.MaterialService.updateMaterial(id, materialDto);

    return response.send(result);
    return result;
  }
  @Delete(':id')
  @UseInterceptors(ApiResInterceptor)
  async removeUser(@Param('id') id: bigint): Promise<boolean> {
    console.log('id', id);
    return this.MaterialService.removeUser(id);
  }

  convertAdvInfo(material: any): any {
    // Make a shallow copy of the user object

    const materialDto: MaterialDto = {
      id: Number(material.id),
      name: material.name,
      mediaType: material.mediaType,
      contentType: material.contentType,
      enabled: material.enabled,
      position: material.position,
      content: material.content,
      url: material.url,
      advertiserId: Number(material.advertiserId),

      advertiser: {
        taxNumber: material.advertiser.taxNumber,
        id: Number(material.advertiser.id), // 将 bigint 转换为 number
        companyName: material.advertiser.companyName,
        user: {
          id: Number(material.advertiser.user.id), // 将 bigint 转换为 number
          nickname: material.advertiser.user.nickname,
        }, // 使用对象字面量设置 user 属性的值
      },
    };
    // Convert the 'id' property to BigInt

    return materialDto;
  }
  convertAgentInfo(material: any): any {
    // Make a shallow copy of the user object

    const materialDto: MaterialDto = {
      id: Number(material.id),
      name: null,
      mediaType: material.mediaType,
      contentType: material.contentType,
      enabled: null,
      position: material.position,
      content: material.content,
      url: material.url,
      advertiserId: null,
      advertiser: {
        id: Number(material.advertiser.id), // 将 bigint 转换为 number
        companyName: material.advertiser.companyName,
        taxNumber: material.advertiser.taxNumber,
        user: {
          id: null, // 将 bigint 转换为 number

          nickname: null,
        }, // 使用对象字面量设置 user 属性的值
      },
    };
    // Convert the 'id' property to BigInt

    return materialDto;
  }
}
