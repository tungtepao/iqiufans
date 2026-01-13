# 神之一手


## 通过云函数实现访问统计功能

src/index.js

themes/butterfly/source/js/esa-analytics.js


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


### 本项目由阿里云ESA提供加速、计算和保护

![aliyun](docs/images/aliyun.png)