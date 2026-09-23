/**
 * Formatting Utilities for Bangladeshi Madrasah SaaS
 */

const BENGALI_NUMERALS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

/**
 * Converts English numerals to Bengali digits
 */
export function toBengaliNumerals(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  return String(num).replace(/\d/g, (d) => BENGALI_NUMERALS[parseInt(d, 10)] || d);
}

/**
 * Converts Bengali numerals back to English digits
 */
export function toEnglishNumerals(str: string): string {
  if (!str) return '';
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
}

/**
 * Formats amount in Bangladeshi Taka (৳)
 * @param amount - Number to format
 * @param locale - 'bn' for Bengali numerals, 'en' for standard
 */
export function formatTaka(amount: number, locale: string = 'bn'): string {
  if (isNaN(amount)) return locale === 'bn' ? '৳ ০.০০' : '৳ 0.00';
  
  const formattedEn = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (locale === 'bn') {
    return `৳ ${toBengaliNumerals(formattedEn)}`;
  }
  return `৳ ${formattedEn}`;
}

/**
 * Formats a Date string into standard readable format
 */
export function formatDate(dateString: string | Date, locale: string = 'bn'): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  if (locale === 'bn') {
    return `${toBengaliNumerals(day)} ${BENGALI_MONTHS[month]}, ${toBengaliNumerals(year)}`;
  }
  
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Standardizes BD Mobile number (e.g. 01712345678 -> 01712-345678)
 */
export function formatBdMobile(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
}

const ONES_BN = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
const TEENS_BN = ['দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ'];
const TENS_BN = ['', 'দশ', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];

/**
 * Converts a positive number to Bengali words for receipts (e.g. ৫,৫০০ -> পাঁচ হাজার পাঁচশত টাকা মাত্র)
 */
export function numberToBanglaWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'শূন্য টাকা মাত্র';

  const integerPart = Math.floor(Math.abs(amount));

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 10) return ONES_BN[n];
    if (n >= 10 && n < 20) return TEENS_BN[n - 10];
    const ten = Math.floor(n / 10);
    const one = n % 10;
    return `${TENS_BN[ten]} ${ONES_BN[one]}`.trim();
  }

  function convertGroup(n: number): string {
    let words = '';
    const crore = Math.floor(n / 10000000);
    let rem = n % 10000000;
    const lakh = Math.floor(rem / 100000);
    rem = rem % 100000;
    const thousand = Math.floor(rem / 1000);
    rem = rem % 1000;
    const hundred = Math.floor(rem / 100);
    const lastTwo = rem % 100;

    if (crore > 0) {
      words += `${convertTwoDigits(crore)} কোটি `;
    }
    if (lakh > 0) {
      words += `${convertTwoDigits(lakh)} লাখ `;
    }
    if (thousand > 0) {
      words += `${convertTwoDigits(thousand)} হাজার `;
    }
    if (hundred > 0) {
      words += `${ONES_BN[hundred]} শত `;
    }
    if (lastTwo > 0) {
      words += convertTwoDigits(lastTwo);
    }

    return words.trim();
  }

  const inWords = convertGroup(integerPart);
  return `${inWords} টাকা মাত্র`;
}
