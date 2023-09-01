环境要求
pnpm
nodejs

1.安装依赖
```shell
pnpm install
```
2.初始化数据库
```shell
npx prisma generate
npx prisma migrate dev
```

3.创建超级用户
```shell
pnpm artisan create-root-user
```
4.生成服务器 key
```shell
pnpm artisan generate-key
```
