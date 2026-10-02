/**
 * Next.js Route Handler - 代理 api.php 全部接口
 * 重写自 Meting.php v1.3.9 (metowolf/Meting)
 * 纯 TypeScript + fetch + Node crypto，无外部依赖
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCipheriv, createHash, randomBytes } from 'crypto';

// ========== 网易云 AES-ECB 加密 ==========
const NETEASE_KEY = Buffer.from('7246674226682325323F5E6544673A51', 'hex');
function neteaseEncrypt(body: any): string {
  const plain = JSON.stringify(body);
  const padded = pkcs7Pad(Buffer.from(plain));
  const cipher = createCipheriv('aes-128-ecb', NETEASE_KEY, null);
  cipher.setAutoPadding(false);
  const encrypted = Buffer.concat([cipher.update(padded), cipher.final()]);
  return encrypted.toString('hex').toUpperCase();
}
function pkcs7Pad(buf: Buffer, block = 16): Buffer {
  const padLen = block - (buf.length % block);
  return Buffer.concat([buf, Buffer.alloc(padLen, padLen)]);
}

// ========== curl 封装 ==========
interface SiteHeaders {
  referer: string;
  cookie: string;
  useragent: string;
}
function curlHeaders(source: string): SiteHeaders {
  const sites: Record<string, SiteHeaders> = {
    netease: {
      referer: 'https://music.163.com/',
      cookie: 'os=linux; appver=1.0.0.1026; osver=Ubuntu%2016.10',
      useragent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    },
    tencent: {
      referer: 'https://y.qq.com/',
      cookie: '',
      useragent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    },
  };
  return sites[source] || sites.netease;
}

async function httpFetch(
  url: string,
  method: 'GET' | 'POST',
  body?: any,
  source: string = 'netease',
): Promise<string> {
  const headers = curlHeaders(source);
  const init: RequestInit = {
    method,
    headers: {
      Referer: headers.referer,
      Cookie: headers.cookie,
      'User-Agent': headers.useragent,
      Accept: 'application/json, text/plain, */*',
    },
    redirect: 'follow',
  };

  if (method === 'POST') {
    if (typeof body === 'object' && body !== null) {
      // 如果有 encode 就用 AES 加密（网易云 linux/forward）
      if ('eparams' in body === false && source === 'netease') {
        // 普通 POST
        init.headers!['Content-Type'] = 'application/x-www-form-urlencoded';
        init.body = new URLSearchParams(body as any).toString();
      } else {
        init.headers!['Content-Type'] = 'application/x-www-form-urlencoded';
        init.body = new URLSearchParams(body as any).toString();
      }
    }
  }

  const res = await fetch(url, init as any);
  const text = await res.text();
  return text;
}

// ========== 网易云 linux/forward 封装 ==========
async function neteaseForward(
  innerUrl: string,
  innerMethod: 'GET' | 'POST',
  innerParams: any,
): Promise<string> {
  const body = { url: innerUrl, method: innerMethod, params: innerParams };
  const eparams = neteaseEncrypt(body);
  return httpFetch(
    'http://music.163.com/api/linux/forward',
    'POST',
    { eparams },
    'netease',
  );
}

// ========== 网易云 URL pickkey（封面图片） ==========
function neteasePickkey(id: string): string {
  const magic = '3go8&$8*3*3h0k(2)2'.split('');
  const sid = String(id).split('');
  for (let i = 0; i < sid.length; i++) {
    sid[i] = String.fromCharCode(sid[i].charCodeAt(0) ^ magic[i % magic.length].charCodeAt(0));
  }
  const md5 = createHash('md5').update(Buffer.from(sid.join(''))).digest();
  let b64 = md5.toString('base64');
  b64 = b64.replace(/\//g, '_').replace(/\+/g, '-');
  return b64;
}

// ========== Format 统一化（网易云） ==========
function formatNetease(data: any): any {
  return {
    id: data.id,
    name: data.name,
    artist: (data.ar || []).map((a: any) => a.name),
    album: data.al?.name || '',
    pic_id: data.al?.pic_str || String(data.al?.pic || ''),
    url_id: data.id,
    lyric_id: data.id,
    source: 'netease',
  };
}

// ========== Main Handler ==========
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const types = searchParams.get('types') || '';
  const source = searchParams.get('source') || 'netease';
  const callback = searchParams.get('callback') || '';

  let result: any = null;
  let rawData: string = '';

  try {
    switch (types) {
      case 'search': {
        const name = searchParams.get('name') || '';
        const limit = parseInt(searchParams.get('count') || '20');
        const page = parseInt(searchParams.get('pages') || '1');

        if (source === 'netease') {
          const json = await neteaseForward(
            'http://music.163.com/api/cloudsearch/pc',
            'POST',
            {
              s: name,
              type: 1,
              limit,
              total: 'true',
              offset: (page - 1) * limit,
            },
          );
          const data = JSON.parse(json);
          const songs = data?.result?.songs || [];
          const formatted = songs.map(formatNetease);
          rawData = JSON.stringify(formatted);
        } else if (source === 'tencent') {
          const json = await httpFetch(
            `https://c.y.qq.com/soso/fcgi-bin/client_search_cp?format=json&p=${page}&n=${limit}&w=${encodeURIComponent(name)}&aggr=1&lossless=1&cr=1&new_json=1`,
            'GET',
            null,
            'tencent',
          );
          rawData = json;
        }
        break;
      }

      case 'playlist': {
        const id = searchParams.get('id') || '';
        if (source === 'netease') {
          const json = await neteaseForward(
            'http://music.163.com/api/v3/playlist/detail',
            'POST',
            { id, n: 1000 },
          );
          const data = JSON.parse(json);
          const tracks = data?.playlist?.tracks || [];
          const formatted = tracks.map(formatNetease);
          rawData = JSON.stringify(formatted);
        } else if (source === 'tencent') {
          const json = await httpFetch(
            `https://c.y.qq.com/v8/fcg-bin/fcg_v8_playlist_cp.fcg?id=${id}&format=json&newsong=1&platform=jqspaframe.json`,
            'GET',
            null,
            'tencent',
          );
          rawData = json;
        }
        break;
      }

      case 'url': {
        const id = searchParams.get('id') || '';
        if (source === 'netease') {
          const json = await neteaseForward(
            'http://music.163.com/api/song/enhance/player/url',
            'POST',
            { ids: [id], br: 320000 },
          );
          const data = JSON.parse(json);
          const item = data?.data?.[0];
          result = {
            url: item?.url || '',
            br: item?.br ? item.br / 1000 : -1,
          };
          rawData = JSON.stringify(result);
        }
        break;
      }

      case 'lyric': {
        const id = searchParams.get('id') || '';
        if (source === 'netease') {
          const json = await neteaseForward(
            'http://music.163.com/api/song/lyric',
            'POST',
            { id, os: 'linux', lv: -1, kv: -1, tv: -1 },
          );
          const data = JSON.parse(json);
          result = {
            lyric: data?.lrc?.lyric || '',
            tlyric: data?.tlyric?.lyric || '',
          };
          rawData = JSON.stringify(result);
        }
        break;
      }

      case 'pic': {
        const id = searchParams.get('id') || '';
        if (source === 'netease') {
          const pickkey = neteasePickkey(id);
          result = {
            url: `https://p3.music.126.net/${pickkey}/${id}.jpg?param=300y300`,
          };
          rawData = JSON.stringify(result);
        }
        break;
      }

      case 'userlist': {
        const uid = searchParams.get('uid') || '';
        const json = await httpFetch(
          `http://music.163.com/api/user/playlist/?offset=0&limit=1001&uid=${uid}`,
          'GET',
          null,
          'netease',
        );
        rawData = json;
        break;
      }

      default:
        // 默认接口信息页
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>MKOnlinePlayer API</title></head><body><h2>MKOnlinePlayer</h2><p>Next.js Route Handler 版本</p><p>支持接口: search / playlist / url / lyric / pic / userlist</p></body></html>`;
        return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
  } catch (err: any) {
    rawData = JSON.stringify({ error: true, message: String(err?.message || err) });
  }

  // HTTPS 替换
  rawData = rawData.replace(/http:\/\/(?!g\.ss0\.bdstatic)/g, 'https://');

  // JSONP 支持
  if (callback && /^[a-zA-Z0-9_]+$/.test(callback)) {
    rawData = `${callback}(${rawData})`;
  }

  return new NextResponse(rawData, {
    headers: {
      'Content-Type': callback
        ? 'application/javascript; charset=utf-8'
        : 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    },
  });
}
