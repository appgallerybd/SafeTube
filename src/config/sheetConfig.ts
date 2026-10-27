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

  // অটো-রিফ্রেশ ইন্টারভাল (মিনিট হিসেবে, ডিফল্ট ১০ মিনিট)
  CACHE_REFRESH_MINUTES: 10,
};

/**
 * ডিফল্ট নিরাপদ ভিডিও সংগ্রহ (Default Curated Safe Videos)
 * গুগল শিট কনফিগার না করা থাকলেও বা ইন্টারনেট সাময়িক বন্ধ থাকলেও এই ভিডিওগুলো সরাসরি চলবে।
 */
export const DEFAULT_SAFE_VIDEOS: SafeVideo[] = [
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Queen - Bohemian Rhapsody (Official Video Remastered)',
    channel: 'Queen Official',
    category: 'সঙ্গীত ও অডিও',
    duration: '5:59',
    views: '1.7B views',
    url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    description: 'The official music video for Bohemian Rhapsody by Queen. Classic hit for music lovers.',
    thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
  },
  {
    id: 'LXb3EKWsInQ',
    title: '4K African Wildlife - Peaceful Relaxing Nature Documentary with Calming Music',
    channel: 'Nature Relaxation Films',
    category: 'প্রকৃতি ও ভ্রমণ',
    duration: '42:15',
    views: '12M views',
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    description: 'Immerse in the breathtaking beauty of African savannah wildlife in pure 4K ultra high definition.',
    thumbnail: 'https://img.youtube.com/vi/LXb3EKWsInQ/hqdefault.jpg',
  },
  {
    id: 'V1bFr2KGj11',
    title: 'How Deep The Ocean Really Is - Ocean Depth Comparison in 3D',
    channel: 'MetaBallStudios',
    category: 'বিজ্ঞান ও প্রযুক্তি',
    duration: '8:45',
    views: '8.4M views',
    url: 'https://www.youtube.com/watch?v=V1bFr2KGj11',
    description: 'A 3D size comparison revealing the unimaginable depths and mysteries of our blue planet oceans.',
    thumbnail: 'https://img.youtube.com/vi/V1bFr2KGj11/hqdefault.jpg',
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    channel: 'Luis Fonsi',
    category: 'সঙ্গীত ও অডিও',
    duration: '4:41',
    views: '8.3B views',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    description: 'High energy acoustic Latin rhythm, perfect for audio listening and background playback.',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
  },
  {
    id: '2lAe1cqCOXo',
    title: 'Surah Ar-Rahman - Heart Soothing Beautiful Quran Recitation',
    channel: 'Islamic Reflections',
    category: 'নাসীদ ও তিলাওয়াত',
    duration: '18:20',
    views: '35M views',
    url: 'https://www.youtube.com/watch?v=2lAe1cqCOXo',
    description: 'Soul soothing and peaceful recitation of Surah Ar-Rahman. Perfect for screen-off calm listening.',
    thumbnail: 'https://img.youtube.com/vi/2lAe1cqCOXo/hqdefault.jpg',
  },
  {
    id: 'W6NZfCO5SIk',
    title: 'JavaScript Tutorial for Beginners: Learn JavaScript in 1 Hour',
    channel: 'Programming with Mosh',
    category: 'শিক্ষা ও ক্যারিয়ার',
    duration: '48:16',
    views: '4.8M views',
    url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
    description: 'Master core JavaScript programming fundamentals easily and quickly with clear hands-on examples.',
    thumbnail: 'https://img.youtube.com/vi/W6NZfCO5SIk/hqdefault.jpg',
  },
  {
    id: '1La4QzGeaaQ',
    title: 'How The Universe Works - Space Exploration Documentary in 4K',
    channel: 'Science Time',
    category: 'বিজ্ঞান ও প্রযুক্তি',
    duration: '25:30',
    views: '6.1M views',
    url: 'https://www.youtube.com/watch?v=1La4QzGeaaQ',
    description: 'Journey across the cosmos, nebulae, black holes and galaxies in breathtaking ultra high clarity.',
    thumbnail: 'https://img.youtube.com/vi/1La4QzGeaaQ/hqdefault.jpg',
  },
  {
    id: '1-xGerv5FOk',
    title: 'Deep Focus Chill Lo-Fi Beats - Relaxing Music for Study and Sleep',
    channel: 'Lofi Girl Safe',
    category: 'সঙ্গীত ও অডিও',
    duration: '60:00',
    views: '24M views',
    url: 'https://www.youtube.com/watch?v=1-xGerv5FOk',
    description: 'Gentle study and sleep beats. Optimized for background audio and screen-off playback.',
    thumbnail: 'https://img.youtube.com/vi/1-xGerv5FOk/hqdefault.jpg',
  },
  {
    id: 'gGZ_5m2bHbg',
    title: 'Buraq - Islamic Animation Story for Kids (Safe & Moral)',
    channel: 'Muslim Kids TV',
    category: 'বাচ্চাদের জন্য নিরাপদ',
    duration: '14:10',
    views: '3.2M views',
    url: 'https://www.youtube.com/watch?v=gGZ_5m2bHbg',
    description: 'Safe, beautiful cartoon animation for children teaching valuable morals without inappropriate ads.',
    thumbnail: 'https://img.youtube.com/vi/gGZ_5m2bHbg/hqdefault.jpg',
  },
  {
    id: 'sBws8MSXN7A',
    title: 'Beautiful Switzerland 4K - Scenic Alpine Mountain Villages & Lakes',
    channel: 'Scenic Relaxation',
    category: 'প্রকৃতি ও ভ্রমণ',
    duration: '31:40',
    views: '9.8M views',
    url: 'https://www.youtube.com/watch?v=sBws8MSXN7A',
    description: 'Soothing views of snow-capped mountains, green pastures and crystal clear mountain waters.',
    thumbnail: 'https://img.youtube.com/vi/sBws8MSXN7A/hqdefault.jpg',
  },
  {
    id: 'yKNxeF4KMsY',
    title: 'Coldplay - Yellow (Official High Definition Video)',
    channel: 'Coldplay',
    category: 'সঙ্গীত ও অডিও',
    duration: '4:33',
    views: '1.1B views',
    url: 'https://www.youtube.com/watch?v=yKNxeF4KMsY',
    description: 'Iconic melodic song by Coldplay. Enjoy clean high fidelity audio.',
    thumbnail: 'https://img.youtube.com/vi/yKNxeF4KMsY/hqdefault.jpg',
  },
  {
    id: '8ndydM0B7gE',
    title: 'Surah Al-Mulk - Recitation Before Sleep for Protection & Peace',
    channel: 'Quran Central',
    category: 'নাসীদ ও তিলাওয়াত',
    duration: '11:15',
    views: '19M views',
    url: 'https://www.youtube.com/watch?v=8ndydM0B7gE',
    description: 'Recite or listen to Surah Al-Mulk before sleeping. High quality clear audio reciter.',
    thumbnail: 'https://img.youtube.com/vi/8ndydM0B7gE/hqdefault.jpg',
  },
];
