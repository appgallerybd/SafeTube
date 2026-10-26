import { GOOGLE_SHEET_CONFIG, DEFAULT_SAFE_VIDEOS } from '../config/sheetConfig';
import { SafeVideo } from '../types/video';

const STORAGE_KEY_VIDEOS = 'safetube_videos_cache';
const STORAGE_KEY_TIMESTAMP = 'safetube_videos_timestamp';
const STORAGE_KEY_CUSTOM_URL = 'safetube_custom_sheet_url';

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

  // Regex for youtube.com, youtu.be, shorts, embed
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regex);
  if (match && match[1]) {
    return match[1];
  }

  return null;
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
 * গুগল শিট থেকে ভিডিওগুলো ফেচ ও পার্স করার মূল মেথড
 */
export async function fetchVideosFromGoogleSheet(forceRefresh = false): Promise<SafeVideo[]> {
  // ১. শিট লিঙ্ক নির্ধারণ (কোডের লিঙ্ক অথবা স্টোরেজে সেভ করা লিঙ্ক)
  let sheetUrl = GOOGLE_SHEET_CONFIG.CSV_URL.trim();
  const savedCustomUrl = localStorage.getItem(STORAGE_KEY_CUSTOM_URL);
  if (savedCustomUrl && savedCustomUrl.trim().length > 0) {
    sheetUrl = savedCustomUrl.trim();
  }

  // যদি কোনো শিট লিঙ্ক কনফিগার না থাকে, সরাসরি ডিফল্ট সেফ ভিডিও ফেরত দিন
  if (!sheetUrl) {
    return DEFAULT_SAFE_VIDEOS;
  }

  // ২. ক্যাশ যাচাই (যদি forceRefresh না হয় এবং ক্যাশ মেয়াদোত্তীর্ণ না হয়)
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_VIDEOS);
      const timestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
      if (cached && timestamp) {
        const age = (Date.now() - parseInt(timestamp, 10)) / (1000 * 60);
        if (age < GOOGLE_SHEET_CONFIG.CACHE_REFRESH_MINUTES) {
          const parsed = JSON.parse(cached) as SafeVideo[];
          if (parsed && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // ignore storage error
    }
  }

  // ৩. সরাসরি গুগল শিটের CSV লিংক ফেচ করা
  try {
    // Ensure correct CSV export if user provided a standard Google Sheet edit link
    let fetchTarget = sheetUrl;
    if (sheetUrl.includes('docs.google.com/spreadsheets/d/') && !sheetUrl.includes('export?format=csv') && !sheetUrl.includes('/pub?')) {
      const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        fetchTarget = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
      }
    }

    const response = await fetch(fetchTarget, {
      method: 'GET',
      headers: {
        Accept: 'text/csv, text/plain, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`Sheet response not OK: ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return DEFAULT_SAFE_VIDEOS;
    }

    // ৪. হেডার সনাক্তকরণ
    const headerRow = rows[0].map((h) => h.toLowerCase());
    const hasHeader = headerRow.some((h) =>
      ['url', 'link', 'video', 'youtube', 'title', 'channel', 'category'].some((keyword) => h.includes(keyword))
    );

    let urlColIdx = -1;
    let titleColIdx = -1;
    let channelColIdx = -1;
    let categoryColIdx = -1;
    let durationColIdx = -1;
    let descColIdx = -1;

    if (hasHeader) {
      headerRow.forEach((col, idx) => {
        if (col.includes('url') || col.includes('link') || col.includes('video') || col.includes('youtube')) urlColIdx = idx;
        else if (col.includes('title') || col.includes('name') || col.includes('শিরোনাম')) titleColIdx = idx;
        else if (col.includes('channel') || col.includes('author') || col.includes('creator') || col.includes('চ্যানেল')) channelColIdx = idx;
        else if (col.includes('cat') || col.includes('genre') || col.includes('ট্যাগ') || col.includes('ক্যাটাগরি')) categoryColIdx = idx;
        else if (col.includes('duration') || col.includes('time') || col.includes('সময়')) durationColIdx = idx;
        else if (col.includes('desc') || col.includes('বিবরণ')) descColIdx = idx;
      });
    }

    const dataRows = hasHeader ? rows.slice(1) : rows;
    const parsedVideos: SafeVideo[] = [];

    dataRows.forEach((row, index) => {
      let rawUrl = '';
      let rawTitle = '';
      let rawChannel = '';
      let rawCategory = '';
      let rawDuration = '';
      let rawDesc = '';

      if (hasHeader && urlColIdx !== -1) {
        rawUrl = row[urlColIdx] || '';
        rawTitle = titleColIdx !== -1 ? row[titleColIdx] : '';
        rawChannel = channelColIdx !== -1 ? row[channelColIdx] : '';
        rawCategory = categoryColIdx !== -1 ? row[categoryColIdx] : '';
        rawDuration = durationColIdx !== -1 ? row[durationColIdx] : '';
        rawDesc = descColIdx !== -1 ? row[descColIdx] : '';
      } else {
        // Find cell with youtube id or url
        for (let colI = 0; colI < row.length; colI++) {
          const val = row[colI];
          if (extractYouTubeId(val)) {
            rawUrl = val;
            // Use subsequent cells
            rawTitle = row[colI === 0 ? 1 : 0] || '';
            rawChannel = row[2] || '';
            rawCategory = row[3] || '';
            break;
          }
        }
      }

      const videoId = extractYouTubeId(rawUrl);
      if (videoId) {
        parsedVideos.push({
          id: videoId,
          title: rawTitle.trim() || `নিরাপদ ভিডিও #${index + 1}`,
          channel: rawChannel.trim() || 'Safe Channel',
          category: rawCategory.trim() || 'সাধারণ',
          duration: rawDuration.trim() || 'HD',
          description: rawDesc.trim() || 'নিরাপদ ভিডিও স্ট্রিম (SafeTube Player)',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          views: `${Math.floor(Math.random() * 80 + 10)}K views`,
        });
      }
    });

    if (parsedVideos.length > 0) {
      // ক্যাশে সংরক্ষণ
      try {
        localStorage.setItem(STORAGE_KEY_VIDEOS, JSON.stringify(parsedVideos));
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
      } catch {
        // ignore
      }
      return parsedVideos;
    }

    return DEFAULT_SAFE_VIDEOS;
  } catch (err) {
    console.warn('Google Sheet loading error, using safe fallback collection:', err);
    return DEFAULT_SAFE_VIDEOS;
  }
}

/**
 * শিটের কাস্টম লিংক সেট করার হেল্পার
 */
export function setCustomSheetUrl(url: string) {
  if (url && url.trim().length > 0) {
    localStorage.setItem(STORAGE_KEY_CUSTOM_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
  }
}

export function getCustomSheetUrl(): string {
  return localStorage.getItem(STORAGE_KEY_CUSTOM_URL) || GOOGLE_SHEET_CONFIG.CSV_URL || '';
}
