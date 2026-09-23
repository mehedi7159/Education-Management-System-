/**
 * Validation utilities tailored for Bangladesh Madrasah workflows
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates 11-digit Bangladeshi mobile number starting with 01
 */
export function validateBdMobile(mobile: string, locale: string = 'bn'): ValidationResult {
  if (!mobile || !mobile.trim()) {
    return {
      isValid: false,
      message: locale === 'bn' ? 'মোবাইল নম্বর প্রদান করা আবশ্যক' : 'Mobile number is required'
    };
  }
  const cleanMobile = mobile.replace(/\s|-/g, '');
  const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
  if (!bdPhoneRegex.test(cleanMobile)) {
    return {
      isValid: false,
      message: locale === 'bn' ? 'সঠিক ১১-সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন (যেমন: 017xxxxxxxx)' : 'Enter a valid 11-digit Bangladeshi mobile number'
    };
  }
  return { isValid: true };
}

/**
 * Validates National ID (NID) (Smart NID 10 digits, or Old NID 13/17 digits)
 */
export function validateNid(nid: string, locale: string = 'bn'): ValidationResult {
  if (!nid) return { isValid: true }; // optional
  const cleanNid = nid.trim();
  const validLengths = [10, 13, 17];
  if (!/^\d+$/.test(cleanNid) || !validLengths.includes(cleanNid.length)) {
    return {
      isValid: false,
      message: locale === 'bn' ? 'জাতীয় পরিচয়পত্র নম্বর ১০, ১৩ অথবা ১৭ সংখ্যার হতে হবে' : 'NID must be 10, 13, or 17 digits'
    };
  }
  return { isValid: true };
}

/**
 * Validates 17-digit Online Birth Registration Number (BRN)
 */
export function validateBirthCertificateNo(brn: string, locale: string = 'bn'): ValidationResult {
  if (!brn) return { isValid: true }; // optional
  const cleanBrn = brn.trim();
  if (!/^\d{17}$/.test(cleanBrn)) {
    return {
      isValid: false,
      message: locale === 'bn' ? 'অনলাইন জন্ম নিবন্ধন নম্বরটি ১৭ সংখ্যার হতে হবে' : 'Birth Certificate number must be exactly 17 digits'
    };
  }
  return { isValid: true };
}

/**
 * Standard Email format validation
 */
export function validateEmail(email: string, locale: string = 'bn'): ValidationResult {
  if (!email) return { isValid: true }; // optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      message: locale === 'bn' ? 'সঠিক ইমেইল ঠিকানা প্রদান করুন' : 'Enter a valid email address'
    };
  }
  return { isValid: true };
}

/**
 * Validates non-empty string
 */
export function validateRequired(value: string | number | undefined | null, fieldName: string, locale: string = 'bn'): ValidationResult {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    return {
      isValid: false,
      message: locale === 'bn' ? `${fieldName} প্রদান করা আবশ্যক` : `${fieldName} is required`
    };
  }
  return { isValid: true };
}
