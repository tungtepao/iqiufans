---
title: '记一个简单的图片隐写题'
date: '2025-11-29'
tags: ['CTF']
draft: false
summary: 记一个简单的图片隐写题
cover: images/blog/01/6.png
---

## 记一个简单的图片隐写题

### 题目描述

这是上周参加某行协的CTF比赛一个图片隐写题，第一次遇到，记录一下。

题干：反转蓝色

附件：[题目附件位于CNB](https://cnb.cool/hello.cnb/ctb)

### 解题思路

先上一套日常解题思路：  
1. 使用浏览图片软件直接打开看（软件：irfanview）：包括图片属性、exif等  ————无果  
2. 使用二进制编辑器（010 editor）打开：  ————无果  
3. 直接上binwalk分析是不是有隐藏文件：  ————无果  
![kali](images/blog/01/4.png)  
4. 使用stegsolve走一套流程：  ————无果  
![kali2](images/blog/01/2.png)  
5. 常规会的流程走完，不行，只能回头再看题干，一般题干会有点东西，“反转蓝色”，没办法，尝试一下吧，使用代码换一下蓝色  
```python
from PIL import Image
import numpy as np

img = Image.open('c:\\temp\\sky.png')
img_rgb = img.convert('RGB')
data = np.array(img_rgb)
r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]

# 反转蓝色通道：用255减去每个像素的蓝色值
b_inverted = 255 - b

new_data = np.dstack((r, g, b_inverted)).astype(np.uint8) 
new_img = Image.fromarray(new_data)

new_img.save('c:\\temp\\blue_inverted.png')
```

然后再拿出stegsolve看一下：  
来了！！！！   
![kali3](images/blog/01/6.png)  