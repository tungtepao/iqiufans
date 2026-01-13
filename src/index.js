// 定义一个异步函数 handleRequest

function safeIncrement(str, defaultValue = "0") {
    // 去除首尾空格
    const trimmed = String(str).trim();
    
    // 检查是否为有效数字
    if (trimmed === "" || isNaN(trimmed)) {
        return defaultValue;
    }
    
    // 转换为整数并 +1
    const num = parseInt(trimmed, 10);
    if (isNaN(num)) {
        return defaultValue;
    }
    
    return (num + 1).toString();
}
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  console.alert("Request received:", method, path);
  if (method === "POST" && path === "/api/stats/report") {
    const edgeKV = new EdgeKV({ namespace: "web" });// 命名空间是 web
    let getType = { type: "text" };
    let value = await edgeKV.get("totalAccess", getType);
    let newValue = safeIncrement(value);
    await edgeKV.put("totalAccess", newValue, getType);
    return Response.json({ total: newValue ,oldtotal: value});
  } else if (method === "GET" && path === "/api/stats/summary"){
    const edgeKV = new EdgeKV({ namespace: "web" });// 命名空间是 web
    let getType = { type: "text" };
    let value = await edgeKV.get("totalAccess", getType);
    return Response.json({ total: value });
  }
  return new Response(JSON.stringify({"hello": "world"}));
}
// 导出默认的 fetch 处理函数
export default {
  async fetch(request) {
    return handleRequest(request);
  }
};
