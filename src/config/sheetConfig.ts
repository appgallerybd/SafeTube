import { SafeVideo } from '../types/video';

/**
 * ============================================================================
 * SafeTube Google Sheet কনফিগারেশন ফাইল (Google Sheet Configuration)
 * ============================================================================
 * 
 * এই ফাইলের নিচের `GOOGLE_SHEET_CSV_URL` ভেরিয়েবলে আপনার গুগল শিটের পাবলিশ লিংক বসান।
 * অ্যাপের ইউজার ইন্টারফেসে (UI) কোনো গুগল শিটের টেক্সট বা অপশন শো করবে না।
 * 
 * কিভাবে আপনার Google Sheet যুক্ত করবেন:
 * ---------------------------------------
 * ১. আপনার Google Sheet ওপেন করুন।
 * ২. ফাইলে গিয়ে File > Share > Publish to web (ফাইল > শেয়ার > ওয়েবে প্রকাশ) চাপুন।
 * ৩. 'Entire Document' বা 'Sheet1' সিলেক্ট করুন এবং ড্রপডাউন থেকে 'Comma-separated values (.csv)' বেছে নিন।
 * ৪. 'Publish' বাটনে ক্লিক করে যে লিঙ্কটি আসবে, তা কপি করে নিচের `GOOGLE_SHEET_CSV_URL` এ পেস্ট করুন।
 * 
 * গুগল শিটে কলামের নাম যেমন রাখতে পারেন:
 * - URL বা Link : ইউটিউব ভিডিওর সম্পূর্ণ লিংক (যেমন: https://www.youtube.com/watch?v=...)
 * - Title : ভিডিওর শিরোনাম (ঐচ্ছিক)
 * - Channel : চ্যানেলের নাম (ঐচ্ছিক)
 * - Category : ক্যাটাগরি (যেমন: শিক্ষা, ইসলামিক, প্রযুক্তি, কার্টুন, ইত্যাদি)
 * - Duration : সময় (যেমন: 12:45, ঐচ্ছিক)
 * - Description : বিবরণ (ঐচ্ছিক)
 * 
 * (দ্রষ্টব্য: শিটের যেকোনো কলামে ইউটিউব লিঙ্ক থাকলেই SafeTube নিজে থেকে তা ডিটেক্ট করে নেবে)
 */

export const GOOGLE_SHEET_CONFIG = {
  // এখানে আপনার গুগল শিটের পাবলিশড CSV লিংক দিন (খালি রাখলে নিচের নিরাপদ ডিফল্ট ভিডিওগুলো চলবে)
  CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4FD-ObrJVSkkKm_kTqCr9JQF462qqFnGhmX3IEYeeGfOsyqy0dz3xap7IyQWqbtgfgBCLME1wCAga/pub?gid=0&single=true&output=csv',

  // অটো-রিফ্রেশ ইন্টারভাল (মিনিট হিসেবে, ডিফল্ট ০১ মিনিট)
  CACHE_REFRESH_MINUTES: 01,
};

/**
 * ডিফল্ট নিরাপদ ভিডিও সংগ্রহ (Default Curated Safe Videos)
 * গুগল শিট কনফিগার না করা থাকলেও বা ইন্টারনেট সাময়িক বন্ধ থাকলেও এই ভিডিওগুলো সরাসরি চলবে।
 */
