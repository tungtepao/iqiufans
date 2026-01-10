---
title: '第三届“数信杯”数据安全大赛WP之简单AES'
date: '2025-12-31'
tags: ['CTF']
draft: false
summary: 第三届“数信杯”数据安全大赛WP之简单AES
cover: images/blog/02/0.png
---

# 第三届“数信杯”数据安全大赛WP之简单AES

2025年12月28日，周日，第三届“数信杯”数据安全大赛，这是今年最后一个CTF类的比赛了。

记录一道数安个人赛的简单AES题目。

aes加密题目ctf中出现的频率一般，但是最近俩年，ctf开始分裂细化，出现一个叫数据安全的分支，这个分支中，数据加密就非常常见了。因此有必要梳理一下知识和解题思路。

## 题干

```python
import os
from Crypto.Util.number import *
from Crypto.Cipher import AES
from secret import flag, key
from Crypto.Util.Padding import pad

assert(len(flag) == 38)
assert flag[:5] == b'flag{' and flag[-1:] == b'}'
assert(len(key) == 16)

def padding(msg):
    tmp = 16 - len(msg) % 16
    pad = format(tmp, '02x')
    return bytes.fromhex(pad * tmp) + msg
message = padding(flag)
hint = bytes_to_long(key) ^ bytes_to_long(message[:16])
message = pad(message, 16, 'pkcs7')
IV = os.urandom(16)
encryption = AES.new(key, AES.MODE_CBC, iv=IV)
enc = encryption.encrypt(message)

print('enc =', enc.hex())
print('hint =', hex(hint)[2:])

# enc = 1ce1df3812668ce0bccd86c146cc56989681e128edd0676f5d26e01abdee90c860e22a5a491f94ac5ca3ab02242740fb8c35a3b60ea737ca0d2662fba2b0e299
# hint = 32393f4e3c3c4f3e323a512a5356437d
```

题干很简单，一段代码，有2个输出，然后需要根据这个输出和代码，写一段逆向的代码，把未告知的flag计算出来。

题外话： 感觉这类题目，考程序员的知识，远超于网安了。

## 知识储备

为了解这道题，必须梳理一下基础知识，否则都看不懂这段代码，逆向也就无从谈起了。

AES加密CBC模式：  
AES（Advanced Encryption Standard）：对称加密，分组加密，分组大小128位（16字节） 
CBC (Cipher Block Chaining): 密码分组链接,简单说就是引入一个随机变量IV，避免同样明文加密的密文一样，导致容易被破解
IV：就是那个随机数，分组链接的意思是：第一块密文解密后与IV异或得到第一块明文，后续块解密后与前一块密文异或

## 加密代码分析


1. **flag和key的基本信息**：  
   - flag长度为38字节，格式为`b'flag'`（开头`b'flag'`，结尾`b''`）。  
   - key长度为16字节。

2. **自定义填充（padding函数）**：  
   对flag进行前置填充，填充长度为`16 - len(flag) % 16`（此处`len(flag)=38`，故填充10字节），填充内容为十六进制表示的填充长度（即`0x0a`，共10字节）。填充后长度48字节记为M1（明文第一组）

3. **hint的计算**：  
   `hint = bytes_to_long(key) ^ bytes_to_long(M1[:16])`，即key的整数形式与`M1`前16字节的整数形式异或。由此可推知：`key`与`M1[:16]`的每个字节存在异或关系（`key[i] = M1[:16][i] ^ hint[i]`）。

4. **PKCS#7填充**：  
   对`M1`进行PKCS#7填充（因`M1`长度为48字节，是16的倍数，故填充16字节的`0x10`），结果记为`M2`（长度64字节）。

5. **AES-CBC加密**：  
   用key和随机IV对`M2`加密，得到密文`enc`（64字节）。

## 逐步完成代码

使用notebook来逐步完成逆向代码：

1. 导入包

```python
from Crypto.Util.number import *
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
```

2. 已知数据
   
```python
enc_hex = "1ce1df3812668ce0bccd86c146cc56989681e128edd0676f5d26e01abdee90c860e22a5a491f94ac5ca3ab02242740fb8c35a3b60ea737ca0d2662fba2b0e299"
enc = bytes.fromhex(enc_hex)
# 密文分块（16字节每块）
blocks = [enc[i:i+16] for i in range(0, len(enc), 16)]

# hint
hint_hex = "32393f4e3c3c4f3e323a512a5356437d"
hint_bytes = bytes.fromhex(hint_hex)
hint_long = bytes_to_long(hint_bytes)
```

3. 分组加密第一块
   
根据分析，分组加密第一块16字节，前面15个是已知的:  
前10是补的固定值，中间5个是"flag\{"，只有最后一个未知,所以

```python
m16 = b'\x0a' * 10 + b'flag{' + bytes(0x0)  # 先假设第16个字符为0x0

# 根据题干的代码，key为
key_long = hint_long ^ bytes_to_long(m16)
key = long_to_bytes(key_long, 16)
```

4. 计算IV

计算IV，根据前面回顾的基础知识，知道了第一段明文、密文，计算出IV

```python
aes = AES.new(key, AES.MODE_CBC, iv=bytes(16))  # 临时IV不影响解密结果
d1 = aes.decrypt(blocks[0])
iv = bytes([m16[i] ^ d1[i] for i in range(16)])  # IV = m16 ^ d1
```

5. 解密密文

有密钥key，有iv，对于aes加密来说就是万事俱备啊，解密：

```python
aes_cbc = AES.new(key, AES.MODE_CBC, iv=iv)
plaintext_padded = aes_cbc.decrypt(enc)
```

打印结果如下图：

![单个结果](images/blog/02/1.png)

6. 暴力破解

有了逻辑就简单了，一个字符8位256个嘛，暴力都谈不上循环一下

```python
for i in range(256):
    m16 = b'\x0a' * 10 + b'flag{' + bytes([i])
    key_long = hint_long ^ bytes_to_long(m16)
    key = long_to_bytes(key_long, 16)
    aes = AES.new(key, AES.MODE_CBC, iv=bytes(16))
    d1 = aes.decrypt(blocks[0])
    iv = bytes([m16[i] ^ d1[i] for i in range(16)])
    aes_cbc = AES.new(key, AES.MODE_CBC, iv=iv)
    plaintext_padded = aes_cbc.decrypt(enc)
    print(plaintext_padded)
```

结果如下图：

![多个结果](images/blog/02/2.png)

眼睛一扫，是不是看到答案了^_^

## 完整代码

简单优化一下代码，解码代码如下：

```python
from Crypto.Util.number import *
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

enc_hex = "1ce1df3812668ce0bccd86c146cc56989681e128edd0676f5d26e01abdee90c860e22a5a491f94ac5ca3ab02242740fb8c35a3b60ea737ca0d2662fba2b0e299"
enc = bytes.fromhex(enc_hex)

# 密文分块（16字节每块）
blocks = [enc[i:i+16] for i in range(0, len(enc), 16)]

hint_hex = "32393f4e3c3c4f3e323a512a5356437d"
hint_bytes = bytes.fromhex(hint_hex)
hint_long = bytes_to_long(hint_bytes)

for c in range(256):
    m16 = b'\x0a' * 10 + b'flag{' + bytes([c])
    # 计算key
    key_long = hint_long ^ bytes_to_long(m16)
    key = long_to_bytes(key_long, 16)

    try:
        aes = AES.new(key, AES.MODE_CBC, iv=bytes(16))  # 临时IV不影响解密结果
        d1 = aes.decrypt(blocks[0])
        iv = bytes([m16[i] ^ d1[i] for i in range(16)])  # IV = m16 ^ d1        
         # 用计算出的IV解密整个密文
        aes_cbc = AES.new(key, AES.MODE_CBC, iv=iv)
        plaintext_padded = aes_cbc.decrypt(enc)    
        plaintext = unpad(plaintext_padded, 16)[10:]
        if plaintext[:5] == b'flag{' and plaintext[-1:] == b'}':
            print(plaintext)
    except Exception as e:
        continue    
```

## 收获

收获个屁！  

作为应用程序员，谁没事研究aes加密过程，只知道拿来用！！
作为打ctf的，我为什么要看懂这些代码？

结果就一个： 超过35岁被淘汰的程序员们！ 开始打ctf吧！！！