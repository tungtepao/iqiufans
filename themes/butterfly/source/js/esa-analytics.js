console.log("ESA Analytics script loaded.");
// themes/butterfly/source/js/esa-analytics.js

// 示例：模拟获取数据并更新页面
document.addEventListener('DOMContentLoaded', function() {
  // 1. 上报页面访问
  reportPageView();

  // 2. (可选) 从后端API获取统计数据并更新页面
  fetchAndDisplayStats();
});

function reportPageView() {
  // 你的上报逻辑，例如向你的服务器发送一个POST请求
  const pageData = {
    url: window.location.href,
    title: document.title,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  };
  // 使用 sendBeacon 或 fetch 上报，确保页面跳转时也能发送
  navigator.sendBeacon('/api/stats/report', JSON.stringify(pageData));
}

async function fetchAndDisplayStats() {
  try {
    // 从你的统计后端API获取数据
    const response = await fetch('/api/stats/summary');
    const stats = await response.json();
    
    // 更新页面上的显示
    const pvElement = document.querySelector('#my-stats-container .site-pv');
    const uvElement = document.querySelector('#my-stats-container .site-uv');
    if(pvElement) pvElement.textContent = `总访问量: ${stats.totalPV}`;
    if(uvElement) uvElement.textContent = `总访客数: ${stats.totalUV}`;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
}