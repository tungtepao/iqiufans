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
2. ESA函数收到图片后，使用Node.js的sharp库来处理图片
3. 处理完成后，将图片上传到博客网站的图片存储服务

### 代码

```javascript
const sharp = require('sharp');

exports.handler = async function(event, context) {
  const imageBuffer = Buffer.from(event.body, 'base64');
  const processedImageBuffer = await sharp(imageBuffer)
    .rotate() // 自动旋转图片
    .resize(800, 600) // 压缩图片
    .toBuffer();

  return {
    statusCode: 200,
    body: processedImageBuffer.toString('base64'),
    headers: {
      'Content-Type': 'image/jpeg',
    },
  };
};
```

### 部署

1. 在ESA函数服务上创建一个新函数