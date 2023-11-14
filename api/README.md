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

5.报表计算(日期是开始计算数据的日期)

```shell
pnpm artisan execute-calculate 2023-11-02
```

6.计划报表计算(日期是计划结束时间)

```shell
pnpm artisan execute-calculate-placment 2023-09-01
```
