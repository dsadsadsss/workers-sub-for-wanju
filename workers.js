// 使用 KV 存储节点
// 你需要在 Cloudflare 控制台中创建名称kv的KV空间，并在woker设置绑定这个空间，变量名URL_STORE
const UUID = 'gl1568'; // 上传密钥
const TOKEN = 'mg8888'; // 订阅密钥
// 手动添加自定义节点链接,为避免关键词屏蔽，协议前缀vles写成{PASS}，vmes写成{BASS}，其他协议直接写
let SUB2 = [
  '{PASS}://62e1eg0b-62@ip.sb:443?path=%2FgugKXXlL&security=tls&encryption=none&alpn=h2,http/1.1&host=BpP-eN6.PaGeS.Dev&fp=randomized&type=ws&sni=bPp-eN6.PAGes.dEv#US_pages',
];
// 排除带关键词的节点，用分号分隔
const excludeKeywords = 'PL-serv00;unwanted' 
// 预处理 SUB2
const xieyi = 'vl'
const xieyi2 = 'ess'
const pm = 'vm';


function preProcessUrl(url) {
  let isSpecialFormat = false;
  if (url.startsWith('{BASS}://') || url.startsWith(`${pm}ess://`)) {
    isSpecialFormat = true;
  }

  if (isSpecialFormat) {
    
    let encodedPart = url.split('://')[1];
    
    let decodedUrl = atob(encodedPart);
    
    let urlWithPrefix = `${pm}ess://` + decodedUrl;
  
    return urlWithPrefix.replace(/\{PASS\}\-/g, "")
                        .replace(/\{PA/g, xieyi)
                        .replace(/SS\}/g, xieyi2)
                        .replace(/\{BA/g, pm);
  } else {
    
    return url.replace(/\{PASS\}\-/g, "")
              .replace(/\{PA/g, xieyi)
              .replace(/SS\}/g, xieyi2)
              .replace(/\{BA/g, pm);
  }
}


SUB2 = SUB2.map(url => preProcessUrl(url));

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname
  if (path === `/upload-${UUID}` && request.method === 'POST') {
    return handleUpload(request)
  } else if (path === `/token=${TOKEN}`) {
    return handleToken(request)
  } else {
    return new Response('hello world', { status: 200 })
  }
}

async function handleUpload(request) {
  const { URL_NAME, URL } = await request.json()
  if (!URL_NAME || !URL) {
    return new Response('Missing URL_NAME or URL', { status: 400 })
  }
  
  
  let processedURL = preProcessUrl(URL);

  // 检查是否包含排除关键词
  const excludeList = excludeKeywords.split(';').map(keyword => keyword.trim());
  if (excludeList.some(keyword => processedURL.includes(keyword))) {
    // 静默丢弃含有关键词的 URL
    return new Response('OK', { status: 200 })
  }
  
  await URL_STORE.put(URL_NAME, JSON.stringify({
    urlName: URL_NAME,
    url: processedURL,
    lastUpdate: Date.now()
  }), { expirationTtl: 600 }) // 10 minutes expiration
  return new Response('OK', { status: 200 })
}

async function handleToken(request) {
  const { searchParams } = new URL(request.url)
  const cf_ip = searchParams.get('cf_ip')
  const cf_port = searchParams.get('cf_port')
  if (!cf_ip || !cf_port) {
    return new Response('Missing cf_ip or cf_port in query parameters', { status: 400 })
  }
  let urls = []
  // 从 KV 存储获取 URLs
  const kvUrls = await URL_STORE.list()
  for (const key of kvUrls.keys) {
    const value = await URL_STORE.get(key.name)
    if (value) {
      const data = JSON.parse(value)
      urls.push(data.url)
    }
  }
  urls = urls.concat(SUB2);
  

  urls = urls.map(url => {
    if (url.includes('YOUXUAN_IP') || url.includes('ip.sb')) {
      url = url.replace(/YOUXUAN_IP|ip\.sb/g, cf_ip)
                .replace(/\b(443|8443)\b/g, cf_port)
                .replace(/CF_PORT/g, cf_port)
      
      if (cf_port === '80' || cf_port === '8080') {
        url = url.replace(/=tls/g, '=none')
                 .replace(/tls\",/g, '\",')
      }
    } else {
      url = url.replace(/YOUXUAN_IP|ip\.sb/g, cf_ip)
                .replace(/CF_PORT/g, cf_port)
    }
    return url
  })

// 处理以 ${pm}ess:// 开头的 URL
urls = urls.map(url => {
  if (url.startsWith(`${pm}ess://`)) {
    let content = url.split('://')[1];  // 去掉前缀
    let encodedContent = btoa(content);
    return `${pm}ess://` + encodedContent;
  }
  return url;
});

  const content = urls.join('\n')
  const encodedContent = btoa(content)
  return new Response(encodedContent, {
    headers: { 'Content-Type': 'text/plain' }
  })
}
