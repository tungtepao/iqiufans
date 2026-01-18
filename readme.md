# 神之一手


## 评论功能

集成了评论插件twikoo：

1. 权限开发了用于ESA函数部署的后端部分，使用KV存储（开发中，已经完成匿名评论功能）

后端项目： ![twikoo-api-for-esa](https://github.com/tungtepao/twikoo-api-for-esa)

2. 修改了前端代码，实现前端刷新评论，拒绝全量刷新，以解决KV存储延时导致的最新评论无法获取的问题。

fork twikoo项目，并修改： ![twikoo-client-for-esa](https://github.com/tungtepao/twikoo-client-for-esa)


## 通过ESA云函数实现访问统计功能

1. 云函数服务端：  

src/index.js

2. 主题汇报和获取数据：

themes/butterfly/source/js/esa-analytics.js

3. 主题配置修改： 

3.1 修改主题配置文件  

_config.butterfly.yml

```yaml
...

inject:
  head:
    # - <link rel="stylesheet" href="/xxx.css">
  bottom:
    - <script src="/js/esa-analytics.js"></script>

...

esa_analytics:
  site_uv: true
  site_pv: true
  page_pv: true    

...
```

3.2 模板

themes/butterfly/layout/includes/widgets/card_webinfo.pug

```html
略
```


### 本项目由阿里云ESA提供加速、计算和保护

![aliyun](docs/images/aliyun.png)