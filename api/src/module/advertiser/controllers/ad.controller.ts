import { Controller, Get, Param, Render } from "@nestjs/common";
import sqids from "src/utils/sqids";
import { AdMaterialService } from "../services/admaterial.service";
import { PlacementService } from "../services/placement.service";
import { PositionService } from "../services/position.service";
import { ConfigService } from "@nestjs/config";

@Controller('/s')
export class AdController{
    constructor(
        protected adMaterialService: AdMaterialService,
        protected positionService: PositionService,
        protected placementService: PlacementService,
        protected configService: ConfigService,
        ) { } 
    @Get('/page/:hashid')
    @Render('ad')
    async show(@Param('hashid') hashid: string) {
        const id = sqids.de(hashid)
        console.log(id);
        const material= await this.adMaterialService.findById(BigInt(id))
        const size = material.adPosition.adSpec.size.split('*')
        const width = Number(size[0])
        const height = Number(size[1])
        return {
            width,
            height,
            url: `https://cdn.adbaba.net/${material.url}`,
            link: material.jumpUrl,
        }
    }
    @Get('/pc-screen/:positionHashId')
    @Render('pc-screen')
    async screen(@Param('positionHashId') positionHashId: string){
        const id = sqids.de(positionHashId)
        const position = await this.positionService.findById(BigInt(id))
        if (!position || position.enabled == false) {
            throw new Error('广告位不存在')
        }
        // 查询出所有关联的广告位
        let materials = await this.positionService.findMaterialsById(BigInt(id))
        if (materials.length <= 0){
            throw new Error('广告位没有关联素材')
        }
        materials = materials.filter((v) => {
            if (v.url == '' || v.url == "default-ad.jpg") {
                return false
            }
            return true;
        });
        const material = materials[Math.floor(Math.random() * materials.length)]
        console.log('选中 material',material);
        const link = material.jumpUrl ?? '#'
        console.log({
            url: `https://cdn.adbaba.net/${material.url}`,
            link,
        })
        return {
            url: `https://cdn.adbaba.net/${material.url}`,
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
        if (materials.length <= 0){
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
        if (materials.length <= 0){
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
}