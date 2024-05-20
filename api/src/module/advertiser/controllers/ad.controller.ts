import { Controller, Get, Param, Render, Req } from "@nestjs/common";
import sqids from "src/utils/sqids";
import { AdMaterialService } from "../services/admaterial.service";
import { PlacementService } from "../services/placement.service";
import { PositionService } from "../services/position.service";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { TimeCurvePlacementByDayService } from "../services/time-curve-placement-by-day.service";
import dayjs from "dayjs";
import CryptoJS from "crypto-js";
import axios from "axios";
import fs from 'fs'
@Controller('/s')
export class AdController {
    constructor(
        protected adMaterialService: AdMaterialService,
        protected positionService: PositionService,
        protected placementService: PlacementService,
        protected configService: ConfigService,
        protected timeCurvePlacementByDayService: TimeCurvePlacementByDayService
    ) { }
    async urlToBase64(url: string) {
        const hash = CryptoJS.MD5(url).toString();
        // 判断缓存文件是否存在
        const tmpFile = `./tmp/${hash}`

        if (fs.existsSync(tmpFile)) {
            const data = fs.readFileSync(tmpFile, {
                encoding: 'base64'
            })
            return data;
        }
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });
        const data = Buffer.from(response.data);
        // 将响应数据转换为 Base64
        fs.writeFileSync(tmpFile, data)
        const base64 = data.toString('base64');
        return base64;
    }
    @Get('/page/:hashid')
    @Render('ad')
    async show(@Param('hashid') hashid: string) {
        const id = sqids.de(hashid)
        const material = await this.adMaterialService.findById(BigInt(id))
        const link = material.jumpUrl == '' ? '#id' : material.jumpUrl;
        // 加载素材并转为base64
        if(!material.url) {
            material.url = 'default/advertiser/0/lDob43Lgz70YGWge.jpg';
        }
        const url = `http://cdn.adbaba.net/${material.url}`
        // 加载url中的图片并转为base64
        const data = await this.urlToBase64(url)
        return {
            url: data,
            link,
        }
    }
    @Get('/pc-screen/:positionHashId')
    @Render('pc-screen')
    async screen(@Param('positionHashId') positionHashId: string) {
        const id = sqids.de(positionHashId)
        console.log('id', id);
        const position = await this.positionService.findById(BigInt(id))
        if (!position || position.enabled == false) {
            throw new Error('广告位不存在')
        }
        // 查询出所有关联的广告位
        let materials = await this.positionService.findMaterialsById(BigInt(id))
        if (materials.length <= 0) {
            throw new Error('广告位没有关联素材')
        }
        materials = materials.filter((v) => {
            if (v.url == '' || v.url == "default-ad.jpg") {
                return false
            }
            return true;
        });
        const material = materials[Math.floor(Math.random() * materials.length)]
        console.log('选中 material', material);
        const link = material.jumpUrl == '' ? '#' : material.jumpUrl;
        console.log({
            url: `http://cdn.adbaba.net/${material.url}`,
            link,
        })
        return {
            url: `http://cdn.adbaba.net/${material.url}`,
            link,
        }
    }
    @Get('/js/:positionHashId')
    @Render('ad-js')
    async js(@Param('positionHashId') positionHashId: string) {
        const id = sqids.de(positionHashId)
        const position = await this.positionService.findById(BigInt(id))
        if (!position || position.enabled == false) {
            throw new Error('广告位不存在')
        }
        // 查询出所有关联的广告位
        let materials = await this.positionService.findMaterialsById(BigInt(id))
        if (materials.length <= 0) {
            throw new Error('广告位没有关联素材')
        }

        const placements = await this.placementService.findManyByMaterialIds(materials.map((v) => v.id))
        materials = materials.filter((v) => {
            const placement = placements.find((p) => p.adMaterialId == v.id)
            if (!placement) {
                return false
            }
            return placement
        })
        if (materials.length <= 0) {
            throw new Error('广告位没有关联素材')
        }
        // 随机取一个素材
        const material = materials[Math.floor(Math.random() * materials.length)]
        const size = position.adSpec.size.split('*')
        const width = Number(size[0])
        const height = Number(size[1])
        const idHash = sqids.en(Number(material.id))
        const appUrl = this.configService.get<string>('APP_URL');
        const pageUrl = `${appUrl}/s/page/${idHash}`
        return {
            width,
            height,
            url: pageUrl
        }
    }
    @Get('/demo')
    @Render('demo')
    async demo() {
        const appUrl = this.configService.get<string>('APP_URL');
        return {
            appUrl
        }
    }
    // 任务下发
    @Get('/task/pull/:positionHashId')
    async taskPull(@Param('positionHashId') positionHashId: string, @Req() request: Request) {
        const positionId = 3n;//sqids.de(positionHashId);
        // 查询出所有关联的广告创意
        let materials = await this.positionService.findMaterialsById(BigInt(positionId));
        const { query } = request;
        const date = (query?.date as string) ?? dayjs().format('YYYY-MM-DD');
        let lists: any[] = [];
        if (materials.length > 0 && /(\d{4})-(\d{2})-(\d{2})/.test(date)) {
            const materialIds = materials.map((v) => v.id);
            const placements = await this.placementService.findManyByMaterialIds(materialIds);
            console.log('placements', placements);
            if (placements.length > 0) {
                const existMaterialIds = placements.map((v) => v.adMaterialId)
                materials = materials.filter((v) => {
                    if (existMaterialIds.includes(v.id)) {
                        return true
                    }
                    return false
                })
                const timeCurves = await this.timeCurvePlacementByDayService.findByIds(placements.map((v) => v.id), date);
                lists = materials.map((v) => {
                    const placement = placements.find((p) => p.adMaterialId === v.id);
                    const timeCurve = (timeCurves.find((item) => item.placementId === placement.id)?.curveData ?? []) as number[];
                    return {
                        id: v.id,
                        // 屏保地址
                        screen_url: `http://s.adbaba.net/s/page/${sqids.en(Number(v.id))}`,
                        // 广告地址
                        info_url: `http://cdn.adbaba.net/pages/s/${sqids.en(Number(v.id)).toLowerCase()}.html`,
                        // 总量
                        total: timeCurve.reduce((a, b) => a + b, 0),
                        // 时间曲线
                        time_curve: timeCurve,
                    }
                });
            }
        }

        return {
            code: 200,
            message: 'ok',
            data: {
                date,
                positionHashId,
                lists: lists
            }
        }
    }
}