import { GOOGLE_SHEET_CONFIG } from '../config/sheetConfig';
import { SafeVideo } from '../types/video';

const STORAGE_KEY_VIDEOS = 'safetube_videos_cache';
const STORAGE_KEY_TIMESTAMP = 'safetube_videos_timestamp';
const STORAGE_KEY_CUSTOM_URL = 'safetube_custom_sheet_url';
const STORAGE_KEY_LAST_URL = 'safetube_last_sheet_url';

/**
 * YouTube লিঙ্ক বা টেক্সট থেকে নিখুঁতভাবে ১১ অক্ষরের ভিডিও আইডি বের করার হেল্পার
 */
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex for youtube.com, youtu.be, shorts, embed, live
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regex);
  if (match && match[1]) {
    return match[1];
  }

  // Extra fallback: check if string contains any watch?v= or youtu.be/ pattern
  const idMatch = trimmed.match(/([a-zA-Z0-9_-]{11})/);
  if (trimmed.includes('youtube') || trimmed.includes('youtu.be')) {
    const secondary = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/);
    if (secondary && secondary[1]) return secondary[1];
  }

  return null;
}

/**
 * গুগল শীটের যেকোনো লিঙ্ককে কার্যকর CSV এক্সপোর্ট লিঙ্কে রূপান্তর করা
 */
export function normalizeGoogleSheetUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (!url) return '';

  // ১. যদি শুধুমাত্র Sheet ID দেওয়া হয় (যেমন: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms)
  if (/^[a-zA-Z0-9-_]{20,}$/.test(url) && !url.includes('/') && !url.includes('.')) {
    return `https://docs.google.com/spreadsheets/d/${url}/export?format=csv`;
  }

  // ২. যদি 'Publish to web' লিঙ্ক হয় (/pubhtml বা /pub)
  if (url.includes('/pubhtml')) {
    url = url.replace('/pubhtml', '/pub?output=csv');
  } else if (url.includes('/pub') && !url.includes('output=csv')) {
    url = url.includes('?') ? `${url}&output=csv` : `${url}?output=csv`;
  }

  // ৩. যদি সাধারণ Google Sheet শেয়ার/এডিট লিঙ্ক হয় (/edit বা /edit#gid=...)
  if (url.includes('docs.google.com/spreadsheets/d/')) {
    const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch && idMatch[1] && !url.includes('/pub')) {
      const sheetId = idMatch[1];
      const gidMatch = url.match(/[#?&]gid=([0-9]+)/);
      const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
      return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
    }
  }

  return url;
}

/**
 * CSV টেক্সট নিরাপদভাবে রো এবং কলামে পার্স করার ফাংশন (কোটেশনের ভেতরের কমা হ্যান্ডেল করে)
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * গুগল শিট থেকে ৩ স্তরের ফলব্যাক সহ CSV ফেচ করা
 */
async function fetchSheetCSV(url: string): Promise<string> {
  const targetUrl = normalizeGoogleSheetUrl(url);

  // ১. ডিরেক্ট ফেচ
  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'text/csv, text/plain, */*',
      },
    });
    if (res.ok) {
      const text = await res.text();
      if (text && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
        return text;
      }
    }
  } catch (err) {
    console.warn('Direct fetch attempt failed, trying CORS proxy fallback:', err);
  }

  // ২. CORS Proxy 1 (api.allorigins.win)
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const text = await res.text();
      if (text && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
        return text;
      }
    }
  } catch (err) {
    console.warn('Proxy 1 attempt failed, trying fallback 2:', err);
  }

  // ৩. CORS Proxy 2 (corsproxy.io)
  try {
    const proxyUrl2 = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl2);
    if (res.ok) {
      const text = await res.text();
      if (text && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
        return text;
      }
    }
  } catch (err) {
    console.warn('Proxy 2 attempt failed:', err);
  }

  throw new Error('Could not fetch CSV from the provided Google Sheet URL.');
}

/**
 * গুগল শিট থেকে ভিডিওগুলো ফেচ ও পার্স করার মূল মেথড
 */
export async function fetchVideosFromGoogleSheet(forceRefresh = false): Promise<SafeVideo[]> {
  // কোডের ফাইল (sheetConfig.ts) থেকে সরাসরি গুগল শিট লিঙ্ক নেওয়া
  const sheetUrl = GOOGLE_SHEET_CONFIG.CSV_URL.trim();

  // যদি কোনো শিট লিঙ্ক কনফিগার না থাকে, খালি তালিকা ফেরত দিন
  if (!sheetUrl) {
    return [];
  }

  // লিঙ্ক পরিবর্তন হলে স্বয়ংক্রিয়ভাবে ক্যাশ বাতিল করে নতুন লিঙ্ক ফেচ করবে
  const lastUrl = localStorage.getItem(STORAGE_KEY_LAST_URL);
  if (lastUrl !== sheetUrl) {
    forceRefresh = true;
    try {
      localStorage.removeItem(STORAGE_KEY_VIDEOS);
      localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
    } catch {
      // ignore
    }
  }

  // ২. ক্যাশ যাচাই (যদি forceRefresh না হয় এবং ক্যাশ মেয়াদোত্তীর্ণ না হয়)
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_VIDEOS);
      const timestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
      if (cached && timestamp) {
        const parsed = JSON.parse(cached) as SafeVideo[];
        // Check if cache contains old mock videos (e.g. Bohemian Rhapsody 'fJ9rUzIMcZQ')
        const hasOldMock = parsed.some((v) => v.id === 'fJ9rUzIMcZQ' || v.id === 'LXb3EKWsInQ');
        if (hasOldMock) {
          localStorage.removeItem(STORAGE_KEY_VIDEOS);
        } else {
          const age = (Date.now() - parseInt(timestamp, 10)) / (1000 * 60);
          if (age < GOOGLE_SHEET_CONFIG.CACHE_REFRESH_MINUTES) {
            if (parsed && parsed.length > 0) {
              return parsed;
            }
          }
        }
      }
    } catch {
      // ignore storage error
    }
  }

  // ৩. গুগল শিট থেকে CSV ফেচ করা
  try {
    const csvText = await fetchSheetCSV(sheetUrl);
    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return [];
    }

    // ৪. হেডার সনাক্তকরণ (স্পেস ট্রিম করে নিখুঁত ম্যাচিং)
    const headerRow = rows[0].map((h) => h.trim().toLowerCase());
    const hasHeader = headerRow.some((h) =>
      ['url', 'link', 'video', 'youtube', 'title', 'channel', 'category', 'লিংক', 'ভিডিও', 'শিরোনাম', 'ক্যাটাগরি'].some((keyword) =>
        h.includes(keyword)
      )
    );

    let urlColIdx = -1;
    let titleColIdx = -1;
    let channelColIdx = -1;
    let categoryColIdx = -1;
    let durationColIdx = -1;
    let descColIdx = -1;

    if (hasHeader) {
      headerRow.forEach((col, idx) => {
        if (
          col.includes('url') ||
          col.includes('link') ||
          col.includes('video') ||
          col.includes('youtube') ||
          col.includes('লিংক')
        )
          urlColIdx = idx;
        else if (col.includes('title') || col.includes('name') || col.includes('শিরোনাম') || col.includes('নাম'))
          titleColIdx = idx;
        else if (
          col.includes('channel') ||
          col.includes('author') ||
          col.includes('creator') ||
          col.includes('চ্যানেল') ||
          col.includes('ক্বারী') ||
          col.includes('কারী')
        )
          channelColIdx = idx;
        else if (col.includes('cat') || col.includes('genre') || col.includes('ট্যাগ') || col.includes('ক্যাটাগরি'))
          categoryColIdx = idx;
        else if (col.includes('duration') || col.includes('time') || col.includes('সময়')) durationColIdx = idx;
        else if (col.includes('desc') || col.includes('বিবরণ')) descColIdx = idx;
      });
    }

    const dataRows = hasHeader ? rows.slice(1) : rows;
    const parsedVideos: SafeVideo[] = [];

    dataRows.forEach((row, index) => {
      let videoId: string | null = null;
      let rawTitle = '';
      let rawChannel = '';
      let rawCategory = '';
      let rawDuration = '';
      let rawDesc = '';

      // First try identified URL column if available
      if (hasHeader && urlColIdx !== -1 && row[urlColIdx]) {
        videoId = extractYouTubeId(row[urlColIdx]);
      }

      // If not found in identified column, scan every cell in the row!
      if (!videoId) {
        for (let colI = 0; colI < row.length; colI++) {
          const val = row[colI];
          const extracted = extractYouTubeId(val);
          if (extracted) {
            videoId = extracted;
            break;
          }
        }
      }

      if (videoId) {
        if (hasHeader) {
          rawTitle = titleColIdx !== -1 ? row[titleColIdx] : '';
          rawChannel = channelColIdx !== -1 ? row[channelColIdx] : '';
          rawCategory = categoryColIdx !== -1 ? row[categoryColIdx] : '';
          rawDuration = durationColIdx !== -1 ? row[durationColIdx] : '';
          rawDesc = descColIdx !== -1 ? row[descColIdx] : '';
        } else {
          // If no headers, use other text columns
          rawTitle = row[0] && !extractYouTubeId(row[0]) ? row[0] : row[1] || '';
          rawChannel = row[2] || '';
          rawCategory = row[3] || '';
        }

        parsedVideos.push({
          id: videoId,
          title: rawTitle.trim() || `নিরাপদ ভিডিও #${index + 1}`,
          channel: rawChannel.trim() || rawCategory.trim() || 'SafeTube',
          category: rawCategory.trim() || 'কুরআন তেলাওয়াত',
          duration: rawDuration.trim() || 'HD',
          description: rawDesc.trim() || 'নিরাপদ ভিডিও স্ট্রিম (SafeTube Player)',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          views: `নিরাপদ স্ট্রিম`,
        });
      }
    });

    if (parsedVideos.length > 0) {
      // ক্যাশে সংরক্ষণ এবং শেষ লিঙ্ক সেভ করা
      try {
        localStorage.setItem(STORAGE_KEY_VIDEOS, JSON.stringify(parsedVideos));
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
        localStorage.setItem(STORAGE_KEY_LAST_URL, sheetUrl);
      } catch {
        // ignore
      }
      return parsedVideos;
    }

    return [];
  } catch (err) {
    console.warn('Google Sheet loading error:', err);
    return [];
  }
}
