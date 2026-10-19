import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Israeli Bank Account Number Validator
 * 
 * Validates Israeli bank account numbers:
 * - Must contain only digits
 * - Length: 4-9 digits
 */
export function bankAccountValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const account = String(value).trim();
    
    // Must contain only digits
    if (!/^\d+$/.test(account)) {
      return { bankAccount: { message: 'accountOnlyDigits' } };
    }
    
    // Check minimum length
    if (account.length < 4) {
      return { bankAccount: { message: 'accountMinLength' } };
    }
    
    // Check maximum length
    if (account.length > 9) {
      return { bankAccount: { message: 'accountMaxLength' } };
    }
    
    return null;
  };
}

/**
 * Bank Branch Number Validator
 * 
 * Validates Israeli bank branch numbers:
 * - Must contain only digits
 * - Length: 1-5 digits
 */
export function bankBranchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const branch = String(value).trim();
    
    // Must contain only digits
    if (!/^\d+$/.test(branch)) {
      return { bankBranch: { message: 'branchOnlyDigits' } };
    }
    
    // Check maximum length
    if (branch.length > 5) {
      return { bankBranch: { message: 'branchMaxLength' } };
    }
    
    return null;
  };
}

/**
 * Loan Amount Validator
 * 
 * Validates loan amount:
 * - Must be a positive number
 * - Maximum 10 digits
 */
export function loanAmountValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    const amount = Number(value);
    
    if (isNaN(amount)) {
      return { loanAmount: { message: 'amountInvalid' } };
    }
    
    if (amount <= 0) {
      return { loanAmount: { message: 'amountPositive' } };
    }
    
    if (amount > 9999999999) {
      return { loanAmount: { message: 'amountTooLarge' } };
    }
    
    return null;
  };
}

/**
 * Name Validator (for first name, last name, account name)
 * 
 * Validates names:
 * - Cannot contain numbers
 * - Length: 2-50 characters
 */
export function nameValidator(minLength = 2, maxLength = 50): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const name = String(value).trim();
    
    // Cannot contain numbers
    if (/\d/.test(name)) {
      return { name: { message: 'nameNoNumbers' } };
    }
    
    // Check minimum length
    if (name.length < minLength) {
      return { name: { message: 'nameMinLength', params: { min: minLength } } };
    }
    
    // Check maximum length
    if (name.length > maxLength) {
      return { name: { message: 'nameMaxLength', params: { max: maxLength } } };
    }
    
    return null;
  };
}

/**
 * Utility function to format currency (ILS)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Utility function to convert number to Hebrew words
 * Based on the n2w function from the legacy code
 */
export function numberToHebrewWords(num: number): string {
  if (num === 0) return 'אפס';
  
  const ones = ['', 'אחד', 'שניים', 'שלושה', 'ארבעה', 'חמישה', 'שישה', 'שבעה', 'שמונה', 'תשעה'];
  const tens = ['', 'עשר', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים', 'שבעים', 'שמונים', 'תשעים'];
  const teens = ['עשר', 'אחד עשר', 'שנים עשר', 'שלושה עשר', 'ארבעה עשר', 'חמישה עשר', 'שישה עשר', 'שבעה עשר', 'שמונה עשר', 'תשעה עשר'];
  
  const convertLessThanHundred = (n: number): string => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    const ten = Math.floor(n / 10);
    const one = n % 10;
    return one ? `${tens[ten]} ו${ones[one]}` : tens[ten];
  };
  
  const convertLessThanThousand = (n: number): string => {
    if (n < 100) return convertLessThanHundred(n);
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    const hundredWord = hundred === 1 ? 'מאה' : hundred === 2 ? 'מאתיים' : `${ones[hundred]} מאות`;
    return remainder ? `${hundredWord} ${convertLessThanHundred(remainder)}` : hundredWord;
  };
  
  if (num < 1000) return convertLessThanThousand(num);
  
  const thousand = Math.floor(num / 1000);
  const remainder = num % 1000;
  const thousandWord = thousand === 1 ? 'אלף' : thousand === 2 ? 'אלפיים' : `${convertLessThanThousand(thousand)} אלף`;
  
  return remainder ? `${thousandWord} ${convertLessThanThousand(remainder)}` : thousandWord;
}
