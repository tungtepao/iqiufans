---
title: '让ESA函数和KV存储为Twikoo评论系统服务'
date: '2026-01-18'
tags: ['ESA']
draft: false
summary: 自主完成一个支持在ESA函数上运行的Twikoo评论系统后端接口
cover: images/blog/03/8.png
---

## 简介

在hexo博客中，Twikoo是一个非常著名的评论系统，开源： [Twikoo](https://github.com/twikoojs/twikoo)

他以支持serverless部署而著名，目前支持了很多种部署方式：

![twikoo支持部署](images/blog/03/9.png)

可惜，没有支持ESA的部署方式……

发一个宏愿： 这个短版，由我来补上！！！

## 架构设计

1. 选择开源的itty-router作为路由框架

[itty-router](https://itty.dev/)

网站有这么一句介绍：Our smallest, full-featured serverless API microrouter

都不用翻译，就是那么贴切！！

2. 存储

选择ESA函数，而不是独立部署，就是为了很大一部分普通用户，没独立服务器，如果再选择一个独立存储，就失去了意义，所以选择自带免费额度的ESA KV存储，就水到渠成了。

## 实现

整个评论插件，包括2部分，前端和后端接口，前端需要集成在hexo主题中，后端接口需要部署在ESA函数中。

### 后端接口实现

项目代码结构：

```code
.
├── build.js
├── docs
│   └── images
│       ├── 4.png
│       └── aliyun.png
├── esa.jsonc
├── package.json
├── pnpm-lock.yaml
├── readme.md
├── src
│   ├── constants.ts
│   ├── edgekv.d.ts
│   ├── index.ts
│   ├── twikoo
│   │   ├── controller.ts
│   │   └── service.ts
│   ├── types.ts
│   └── utils
│       └── esakv.ts
└── tsconfig.json
```

简单说明：

1. utils/esakv.ts

    esa 没用提供操作tv的node type，想用ts，只能自己实现了，还有console.alert，系统后面ESA会提供

2. twikoo/controller.ts

    实现了Twikoo的评论接口，做路由分配。

3. twikoo/service.ts

    实现了Twikoo的评论服务，包括对KV的操作和处理逻辑。

4. index.ts

    ESA函数的入口文件，负责初始化路由和处理请求。

5. build.js

    负责编译ts代码，生成最终的js文件。

6. esa.jsonc

    ESA函数的配置文件，包括函数名称、路由规则、环境变量等。

更详细的可以看代码： [twikoo-api-for-esa](https://github.com/tungtepao/twikoo-api-for-esa)

欢迎大家参与贡献，提交PR！！！ 等ESA大赛结束，尝试联系twikoo，看能不能将代码提交给他们。

## 前端代码

前端代码直接fork了官方的代码，主要修改了：

前端代码： [twikoo-client-for-esa](https://github.com/tungtepao/twikoo-client-for-esa)

前端主要修改了2个部分：

1. 原来的评论更新逻辑，是当提交评论数据给后端接口后，成功则返回一个评论id，前端在重新获取当前文章的所有评论，进行全部更新。

由于KV存储的特殊性，存在一个时间差，所以当提交存储后立即查询，导致最新的评论无法展示出来。

为了解决这个问题，我修改：

1. 修改后端逻辑，当提交评论时，接口返回当前提交评论的所有数据
2. 修改前端更新逻辑，使用js直接更新评论列表，而不是重新获取所有评论。

前端变更的核心代码：

TkComments.vue

```javascript
    onCommentAdded (newComment) {
      this.count++
      if (newComment.rid) {
        // 如果是回复评论，找到父评论并添加到回复列表
        const parentComment = this.comments.find(c => c.id === newComment.rid)
        if (parentComment) {
          if (!parentComment.replies) {
            parentComment.replies = []
          }
          parentComment.replies.push(newComment)
        }
      } else {
        // 如果是顶级评论，直接添加到列表开头
        this.comments.unshift(newComment)
      }
      this.$nextTick(this.onCommentLoaded)
    }
```

另外，为了方便调测，我新建了一个esa pages，用于发布前端代码，方便调试。

在hexo的主题配置中，将twikoo前端代码指向自己的发布版本：

![my cdn](images/blog/03/6.png)

## 效果

激动人心，来看看效果：

![mycdn](images/blog/03/10.png)

## AI验证码的尝试

KV存储是有限的，ESA的免费额度也是有限的，要是被人DD了就完了，所以看到AI验证码的时候，我还是眼前一亮的：

![AI验证码](images/blog/03/11.png)

看着还是让人激动人心的，尚未完全打通……


## 结语

基于ESA函数和KV存储，成功实现了一个支持在ESA函数上运行的Twikoo评论系统后端接口，还没有完全实现原插件的所有功能，先发一版，给自己提提气。