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
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
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
