import { getURLAndInit } from '~/misc/request-helper';

const endpoint = '/proxies';

/*
$ curl "http://127.0.0.1:8080/proxies/Proxy" -XPUT -d '{ "name": "ss3" }' -i
HTTP/1.1 400 Bad Request
Content-Type: text/plain; charset=utf-8

{"error":"Selector update error: Proxy does not exist"}

~
$ curl "http://127.0.0.1:8080/proxies/GLOBAL" -XPUT -d '{ "name": "Proxy" }' -i
HTTP/1.1 204 No Content
*/

export async function fetchProxies(config) {
  const { url, init } = getURLAndInit(config);
  const res = await fetch(url + endpoint, init);
  return await res.json();
}

export async function requestToSwitchProxy(apiConfig, name1, name2) {
  const body = { name: name2 };
  const { url, init } = getURLAndInit(apiConfig);
  const fullURL = `${url}${endpoint}/${name1}`;
  return await fetch(fullURL, {
    ...init,
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function requestDelayForProxy(
  apiConfig,
  name,
  latencyTestUrl = 'https://www.gstatic.com/generate_204'
) {
  const { url, init } = getURLAndInit(apiConfig);
  const qs = `timeout=5000&url=${encodeURIComponent(latencyTestUrl)}`;
  const fullURL = `${url}${endpoint}/${encodeURIComponent(name)}/delay?${qs}`;
  return await fetch(fullURL, init);
}

export async function requestDelayForProxyGroup(
  apiConfig,
  name,
  latencyTestUrl = 'http://www.gstatic.com/generate_202'
) {
  const { url, init } = getURLAndInit(apiConfig);
  const qs = `url=${encodeURIComponent(latencyTestUrl)}&timeout=2000`;
  const fullUrl = `${url}/group/${encodeURIComponent(name)}/delay?${qs}`;
  return await fetch(fullUrl, init);
}

export async function fetchProviderProxies(config) {
  const { url, init } = getURLAndInit(config);
  const res = await fetch(url + '/providers/proxies', init);
  if (res.status === 404) {
    return { providers: {} };
  }
  return await res.json();
}

export async function updateProviderByName(config, name) {
  const { url, init } = getURLAndInit(config);
  const options = { ...init, method: 'PUT' };
  return await fetch(url + '/providers/proxies/' + encodeURIComponent(name), options);
}

export async function healthcheckProviderByName(config, name) {
  const { url, init } = getURLAndInit(config);
  const options = { ...init, method: 'GET' };
  return await fetch(
    url + '/providers/proxies/' + encodeURIComponent(name) + '/healthcheck',
    options
  );
}

export function formatTime(time: string | number | Date): string {
  // 将不同类型的 time 转换为时间戳
  const timestamp = typeof time === 'string' ? new Date(time).getTime() : typeof time === 'number' ? time : time.getTime();

  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000); // 时间差，单位：秒

  if (diff < 60) {
    return '刚刚';
  } else if (diff < 3600) {
    // 不足1小时
    const minutes = Math.floor(diff / 60);
    return `${minutes}分钟前`;
  } else if (diff < 3600 * 24) {
    // 不足1天
    const hours = Math.floor(diff / 3600);
    return `${hours}小时前`;
  } else if (diff < 3600 * 24 * 2) {
    // 不足2天
    return '昨天';
  } else if (diff < 3600 * 24 * 7) {
    // 不足1周
    const days = Math.floor(diff / (3600 * 24));
    return `${days}天前`;
  } else {
    // 超过1周，返回具体日期时间
    const d = new Date(timestamp);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    return `${month}月${day}日 ${hours}时${minutes}分`;
  }
}

