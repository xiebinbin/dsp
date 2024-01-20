// 读取csv
const csv = require('csvtojson');
const path = require('path');
const fs = require('fs');
const csvFilePath = path.join(__dirname, 'test.csv');
const jsonFilePath = path.join(__dirname, 'test.json');
import { PrismaClient } from '@prisma/client';

(async () => {
    const items = await csv().fromFile(csvFilePath);
    const prisma = new PrismaClient({
        datasourceUrl: 'mysql://sodabinbin:sodabinbin@localhost:3306/dsp'
    });
    for (const item of items) {
        try {
            const spec = await prisma.adSpec.findFirst({
                where: {
                    name: item.spec
                }
            })


            console.log(spec);
        } catch (error) {
            console.log(error);
        }
        //console.log(item);
    }
})();