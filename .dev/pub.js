// src/index.js
function safeIncrement(str, defaultValue = "0") {
  const trimmed = String(str).trim();
  if (trimmed === "" || isNaN(trimmed)) {
    return defaultValue;
  }
  const num = parseInt(trimmed, 10);
  if (isNaN(num)) {
    return defaultValue;
  }
  return (num + 1).toString();
}
async function readStreamAsJson(request) {
  const stream = request.body;
  const reader = stream.getReader();
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const allChunks = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }
    const text = new TextDecoder().decode(allChunks);
    return JSON.parse(text);
  } finally {
    reader.releaseLock();
  }
}
async function imagedemo(request) {
  return fetch(request, {
    // 图像处理指令数组（支持多步骤操作）
    image: [
      {
        action: "resize",
        // 动作类型：调整尺寸
        option: {
          mode: "custom",
          // 模式：自定义参数（非cover/contain等预设模式）
          param: {
            p: 90,
            // 图片质量（0-100，值越大质量越高）
            l: 1024
            // 固定宽度（单位：像素）
            // fh: 200      // 可选：固定高度（若设置会覆盖自动计算）
          }
        }
      },
      {
        action: "format",
        // 动作类型：格式转换
        option: {
          param: {
            f: "webp"
            // 目标格式参数（png/jpeg/webp等）
          }
        }
      },
      {
        action: "rotate",
        option: {
          mode: "auto",
          param: {}
        }
      }
      /*             {
                      action: "waterMark",
                      option: {
                          mode: "text",
                          param: {
                              text: "UGhvdG8gRm9yIEVTQQ",
                              x: 10,
                              y: 10,
                              rotate: 100,
                          },
                      },
                  }, */
    ]
  });
}
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const prefix = "/photo/";
  const method = request.method;
  const textType = { type: "text" };
  console.alert("Request received:", method, path);
  if (method === "POST" && path === "/api/stats/report") {
    const jsonData = await readStreamAsJson(request);
    console.alert("Request received body:", jsonData);
    const edgeKV = new EdgeKV({ namespace: "web" });
    let iqiufun_pv = await edgeKV.get("iqiufun_pv", textType);
    if (iqiufun_pv === void 0) {
      iqiufun_pv = "1";
    } else {
      iqiufun_pv = safeIncrement(iqiufun_pv);
    }
    await edgeKV.put("iqiufun_pv", iqiufun_pv, textType);
    let iqiufun_uv = await edgeKV.get("iqiufun_uv", textType);
    console.alert("Request received newuv:", jsonData.newuv);
    if (jsonData.newuv) {
      if (iqiufun_uv === void 0) {
        iqiufun_uv = "1";
      } else {
        iqiufun_uv = safeIncrement(iqiufun_uv);
      }
      await edgeKV.put("iqiufun_uv", iqiufun_uv, textType);
    }
    return Response.json({ iqiufun_pv, iqiufun_uv });
  } else if (method === "GET" && path === "/api/stats/summary") {
    const edgeKV = new EdgeKV({ namespace: "web" });
    let iqiufun_pv = await edgeKV.get("iqiufun_pv", textType);
    let iqiufun_uv = await edgeKV.get("iqiufun_uv", textType);
    return Response.json({ iqiufun_pv, iqiufun_uv });
  } else if (method === "GET" && path.startsWith(prefix)) {
    const newUrl = "https://photo.iqiu.fans/" + path.replace(prefix, "/");
    return imagedemo(new Request(newUrl, request));
  }
  return new Response(JSON.stringify({ "hello": "world" }));
}
var src_default = {
  async fetch(request) {
    return handleRequest(request);
  }
};
export {
  src_default as default
};
