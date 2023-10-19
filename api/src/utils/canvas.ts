// import { Logger } from '@nestjs/common';
// import { createCanvas } from 'canvas';
// export class canvas {
//   private readonly logger = new Logger(canvas.name);
//   width = 100;
//   height = 30;
//   contentWidth = 100;
//   contentHeight = 30;
//   fontSizeMin = 25;
//   fontSizeMax = 30;
//   bgColor = '#fff';
//   canvas = createCanvas(this.width, this.height);
//   ctx = this.canvas.getContext('2d');

//   randomNum(min: number, max: number) {
//     return Math.floor(Math.random() * (max - min) + min);
//   }

//   randomColor(min: number, max: number) {
//     const r = this.randomNum(min, max);
//     const g = this.randomNum(min, max);
//     const b = this.randomNum(min, max);
//     return `rgb(${r},${g},${b})`;
//   }

//   drawPic(identifyCode) {
//     if (this.ctx) {
//       this.ctx.textBaseline = 'bottom';
//       this.ctx.fillStyle = '#e6ecfd';
//       this.ctx.fillRect(0, 0, this.contentWidth, this.contentHeight);
//       for (let i = 0; i < identifyCode.length; i++) {
//         this.drawText(this.ctx, identifyCode[i], i, identifyCode);
//       }
//       this.drawLine(this.ctx);
//       this.drawDot(this.ctx);

//       const bytes = Buffer.from(
//         this.canvas.toDataURL().split(',')[1],
//         'base64',
//       );
//       // fs.writeFileSync(__filename, bytes);

//       return this.canvas.toDataURL();
//     }
//   }

//   drawText(ctx: any, txt: string, i: number, identifyCode: any) {
//     ctx.fillStyle = this.randomColor(50, 160);
//     ctx.font = `${this.randomNum(
//       this.fontSizeMin,
//       this.fontSizeMax,
//     )}px SimHei bold`;
//     const x = (i + 1) * (this.contentWidth / (identifyCode.length + 1));
//     const y = this.randomNum(this.fontSizeMax, this.contentHeight - 3);
//     const deg = this.randomNum(-15, 15);
//     ctx.translate(x, y);
//     ctx.rotate((deg * Math.PI) / 180);
//     ctx.fillText(txt, 0, 0);
//     ctx.rotate((-deg * Math.PI) / 180);
//     ctx.translate(-x, -y);
//   }

//   drawLine(ctx: any) {
//     for (let i = 0; i < 4; i++) {
//       ctx.strokeStyle = this.randomColor(100, 200);
//       ctx.beginPath();
//       ctx.moveTo(
//         this.randomNum(0, this.contentWidth),
//         this.randomNum(0, this.contentHeight),
//       );
//       ctx.lineTo(
//         this.randomNum(0, this.contentWidth),
//         this.randomNum(0, this.contentHeight),
//       );
//       ctx.stroke();
//     }
//   }

//   drawDot(ctx: any) {
//     for (let i = 0; i < 20; i++) {
//       ctx.fillStyle = this.randomColor(0, 255);
//       ctx.beginPath();
//       ctx.arc(
//         this.randomNum(0, this.contentWidth),
//         this.randomNum(0, this.contentHeight),
//         1,
//         0,
//         2 * Math.PI,
//       );
//       ctx.fill();
//     }
//   }
// }
