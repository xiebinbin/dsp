## 广告获取接口

>> POST: /api/ad/info
### 参数

```json
{
  "plan_id": "xx"
}
```

### 响应

```json
{
  "code": 200,
  "msg": "ok",
  "data": {
    "ad": {
      "media_url": "",
      "type": "image",
      "jump_url": ""
    }
  }
}
```
## 展现上报接口
>> POST: /api/ad/show

### 参数
```json
{
  "plan_id": ""
}
```
### 响应
```json
{
  "code": 200,
  "msg": "ok",
  "data": null
}
```
## 点击上报接口
>> POST: /api/ad/click

### 参数
```json
{
  "plan_id": ""
}
```
### 响应
```json
{
  "code": 200,
  "msg": "ok",
  "data": null
}
```


#### 统计说明

1.点击与展现需按照 计划、广告创意、广告主 分别进行统计
2.基础统计粒度为 具体到每天
3.详细统计粒度为 具体到哪一个小时