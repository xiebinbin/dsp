
// import { createCanvas } from 'canvas';
export class randomstr {
  getrandstr(num: number) {
    const chars = 'ABDEFGHJKLMNPRSTUVWXYZabdefghjkmnpqrsuvwxy23456789';
    let str = '';
    for (let i = 0; i < num; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      str += chars[randomIndex];
    }
    return str;
  }
  getrandnum(num: number) {
    const chars = '123456789';
    let str = '';
    for (let i = 0; i < num; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      str += chars[randomIndex];
    }
    return str;
  }
  getrandid() {
    const timestamp = Date.now();
    // 随机数
    const random = Math.random().toString(36).slice(2);
    // ID拼接并转为16进制，ID登录验证使用
    const id = (timestamp + random).toString();
    return id;
  }
}
