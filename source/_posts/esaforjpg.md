---
title: '使用ESA函数完成图片格式转换和压缩'
date: '2025-05-01'
tags: ['ESA']
draft: false
summary: 使用ESA函数完成图片格式转换和压缩,自动旋转图片
cover: images/blog/01/1.jpg
---

## 简介

有人说，10个理工男，有9个半是摄影爱好者，也有人说是9.85个，我从不与他们争，因为，我肯定算一个:smile:

所以说，一个理工男的博客网站，没用相册，肯定是不完整的。

使用hexo来处理相册很简单，但是摄影爱好者的图片，可不是800x600的，1m的图片，即使不放RAW，转成JPG，也是10M往上的，这对博客网站的加载速度是一个很大的考验。

所以，我想，能不能用ESA函数来处理这些图片，压缩一下，放到博客网站上，不就解决了这个问题吗？

## 实现

### 原理

首先得介绍一下ESA提供的图片压缩功能：

阿里云官方文档: [图片处理文档](https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/process-image-by-er?spm=a2c4g.11186623.help-menu-2673927.d_2_14_0_8_7.26652e430LRHic&scm=20140722.H_2878994._.OR_help-T_cn~zh-V_1)

文档显示目前提供：剪裁、缩放、旋转、添加水印

### 实现步骤

1. 新建一个独立的ESA pages，用于部署原始图片

2. 在论坛中，利用的ESA的路由规则，将指定的路由转换到函数处理：

阿里云ESA函数路由规则：

![路由规则](images/blog/03/1.svg)

在相册中，使用图片时，专属一个URL：/photo/

根据路由规则，这个路径的静态文件不存在，则会转到函数处理，本博客的处理函数是：src/index.js

其中关键代码是：

```typescript
    ...
const prefix = '/photo/';
    ...
else if (method === "GET" && path.startsWith(prefix)) {
        const newUrl = 'https://photo.iqiu.fans/' + path.replace(prefix, '/');
        return imagedemo(new Request(newUrl, request));
    }

async function imagedemo(request) {
    return fetch(request, {
        // 图像处理指令数组（支持多步骤操作）
        image: [
            {
                action: 'resize',       // 动作类型：调整尺寸
                option: {
                    mode: 'custom',     // 模式：自定义参数（非cover/contain等预设模式）
                    param: {
                        p: 90,          // 图片质量（0-100，值越大质量越高）
                        l: 1024,        // 固定宽度（单位：像素）
                        // fh: 200      // 可选：固定高度（若设置会覆盖自动计算）
                    },
                },
            },
            {
                action: 'format',       // 动作类型：格式转换
                option: {
                    param: {
                        f: 'webp',       // 目标格式参数（png/jpeg/webp等）
                    },
                },
            },
            {
                action: "rotate",
                option: {
                    mode: "auto",
                    param: {
                    },
                },
            },
        ],
    });
}

```
**PS:**

这里补充疑似遇到的一个BUG：当使用指定单边大小的resize函数时，esa会自动选择最长边进行旋转，只能在处理函数组合中，添加一个自动旋转，才能将处理后的图片转正。

3. 来看看效果

当我们请求原始的图片时候，返回的是结果压缩后的webp图片，还能利用缓存提高网站加载速度。

![图片处理](images/blog/03/5.png)

###  fancybox

这个版本更新，顺便升级了fancybox插件，现在可以在相册中，点击图片，查看大图了。其实，更在意的是，是博文中的图片，博文中图片大部分都是操作截图，有时候用过压缩很难清楚文字，能放大还是很方便的：

![图片处理](images/blog/03/7.png)


## 尾声

好吧，今天先更新到这里