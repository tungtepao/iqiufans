# 神之一手


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