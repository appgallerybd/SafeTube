import { SafeVideo } from '../types/video';

/**
 * ============================================================================
 * SafeTube Google Sheet কনফিগারেশন ফাইল (Google Sheet Configuration)
 * ============================================================================
 * 
 * এখানে আপনার গুগল শিটের পাবলিশড CSV লিঙ্ক বসানো রয়েছে।
 * অ্যাপে কোনো ডিফল্ট ভিডিও থাকবে না—শুধুমাত্র এই শিটের ভিডিওগুলোই প্রদর্শিত হবে।
 */

export const GOOGLE_SHEET_CONFIG = {
  // আপনার গুগল শিটের পাবলিশড CSV লিংক:
  CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4FD-ObrJVSkkKm_kTqCr9JQF462qqFnGhmX3IEYeeGfOsyqy0dz3xap7IyQWqbtgfgBCLME1wCAga/pub?gid=0&single=true&output=csv',

  // অটো-রিফ্রেশ ইন্টারভাল (মিনিট হিসেবে, ১ মিনিট)
  CACHE_REFRESH_MINUTES: 1,
};

/**
 * ডিফল্ট ভিডিও সেকশন সম্পূর্ণ বাদ দেওয়া হয়েছে (খালি অ্যারে)।
 * শুধুমাত্র গুগল শিটের ভিডিওগুলোই অ্যাপে লোড হবে।
 */
export const DEFAULT_SAFE_VIDEOS: SafeVideo[] = [];
