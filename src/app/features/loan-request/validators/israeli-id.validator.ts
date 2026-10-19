import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Israeli ID Number Validator
 * 
 * Validates Israeli ID numbers using the official Luhn-like algorithm:
 * 1. Pad ID to 9 digits with leading zeros
 * 2. Multiply each digit by 1 or 2 alternately (starting with 1 for first digit)
 * 3. If result > 9, subtract 9
 * 4. Sum all results
 * 5. Valid if sum is divisible by 10
 */
export function israeliIdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null; // Let required validator handle empty values
    }
    
    const id = String(value).trim();
    
    // Must contain only digits
    if (!/^\d+$/.test(id)) {
      return { israeliId: { message: 'israeliIdOnlyDigits' } };
    }
    
    // Check length (5-9 digits, will be padded to 9)
    if (id.length < 5) {
      return { israeliId: { message: 'israeliIdMinLength' } };
    }
    
    if (id.length > 9) {
      return { israeliId: { message: 'israeliIdMaxLength' } };
    }
    
    // Pad to 9 digits with leading zeros
    const paddedId = id.padStart(9, '0');
    
    // Apply the Luhn-like algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let digit = parseInt(paddedId[i], 10);
      
      // Multiply by 1 for even positions (0,2,4,6,8), by 2 for odd positions (1,3,5,7)
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
    }
    
    // Check if sum is divisible by 10
    if (sum % 10 !== 0) {
      return { israeliId: { message: 'israeliIdInvalid' } };
    }
    
    return null;
  };
}

/**
 * Passport Number Validator
 * 
 * Validates passport numbers:
 * - Must be 3-20 characters
 * - Can contain letters (A-Z, a-z) and digits (0-9)
 * - Cannot be all zeros
 */
export function passportValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null; // Let required validator handle empty values
    }
    
    const passport = String(value).trim();
    
    // Check minimum length
    if (passport.length < 3) {
      return { passport: { message: 'passportMinLength' } };
    }
    
    // Check maximum length
    if (passport.length > 20) {
      return { passport: { message: 'passportMaxLength' } };
    }
    
    // Must contain only alphanumeric characters
    if (!/^[a-zA-Z0-9]+$/.test(passport)) {
      return { passport: { message: 'passportInvalidChars' } };
    }
    
    // Cannot be all zeros
    if (/^0+$/.test(passport)) {
      return { passport: { message: 'passportAllZeros' } };
    }
    
    return null;
  };
}

/**
 * Identity validator factory
 * Returns the appropriate validator based on identity type
 */
export function identityValidator(identityType: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (identityType === 58) { // Israeli ID
      return israeliIdValidator()(control);
    } else if (identityType === 59) { // Passport
      return passportValidator()(control);
    }
    return null;
  };
}

/**
 * Utility function to validate Israeli ID (can be used outside forms)
 */
export function isValidIsraeliId(id: string): boolean {
  id = String(id).trim();
  
  if (!/^\d+$/.test(id) || id.length < 5 || id.length > 9) {
    return false;
  }
  
  const paddedId = id.padStart(9, '0');
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(paddedId[i], 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  
  return sum % 10 === 0;
}

/**
 * Utility function to validate passport (can be used outside forms)
 */
export function isValidPassport(passport: string): boolean {
  passport = String(passport).trim();
  const regex = /^(?!^0+$)[a-zA-Z0-9]{3,20}$/;
  return regex.test(passport);
}
