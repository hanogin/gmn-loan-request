import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Israeli Phone Number Validator
 * 
 * Validates Israeli phone numbers:
 * - Mobile: 05X-XXXXXXX (10 digits starting with 05)
 * - Landline: 0X-XXXXXXX (9-10 digits starting with 02-09)
 * 
 * Accepts formats with or without dashes
 */
export function israeliPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null; // Let required validator handle empty values
    }
    
    // Remove dashes and spaces for validation
    const phone = String(value).replace(/[-\s]/g, '').trim();
    
    // Israeli phone regex: supports both mobile and landline
    // Mobile: 05X followed by 7 digits (where X is not 7)
    // Landline: 0[2-9] followed by 7-8 digits
    const israeliPhoneRegex = /^0(5[0-689]|[2-4]|[8-9]|7[0-9])[0-9]{7}$/;
    
    if (!israeliPhoneRegex.test(phone)) {
      // More specific error messages
      if (phone.length < 9) {
        return { phone: { message: 'phoneTooShort' } };
      }
      if (phone.length > 10) {
        return { phone: { message: 'phoneTooLong' } };
      }
      return { phone: { message: 'phoneInvalid' } };
    }
    
    return null;
  };
}

/**
 * Mobile Phone Validator (Israeli)
 * Only validates mobile numbers (starting with 05)
 */
export function israeliMobileValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const phone = String(value).replace(/[-\s]/g, '').trim();
    
    // Israeli mobile: 05X followed by 7 digits (where X is 0-6, 8-9)
    const mobileRegex = /^05[0-689][0-9]{7}$/;
    
    if (!mobileRegex.test(phone)) {
      return { mobilePhone: { message: 'mobilePhoneInvalid' } };
    }
    
    return null;
  };
}

/**
 * Country Code Validator
 * Validates international country codes
 */
export function countryCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const code = String(value).trim();
    
    // Country codes are 1-5 digits
    if (!/^\d{1,5}$/.test(code)) {
      return { countryCode: { message: 'countryCodeInvalid' } };
    }
    
    return null;
  };
}

/**
 * Utility function to format Israeli phone number
 */
export function formatIsraeliPhone(phone: string): string {
  const cleaned = phone.replace(/[-\s]/g, '');
  
  if (cleaned.length === 10) {
    // Mobile: 05X-XXX-XXXX
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 9) {
    // Landline: 0X-XXX-XXXX
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }
  
  return phone;
}

/**
 * Utility function to validate Israeli phone (can be used outside forms)
 */
export function isValidIsraeliPhone(phone: string): boolean {
  const cleaned = phone.replace(/[-\s]/g, '').trim();
  const regex = /^0(5[0-689]|[2-4]|[8-9]|7[0-9])[0-9]{7}$/;
  return regex.test(cleaned);
}
