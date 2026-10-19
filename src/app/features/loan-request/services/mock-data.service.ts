import { Injectable, signal } from '@angular/core';
import { Bank, City, Lov } from '../models/loan-request.model';

/**
 * Mock Data Service
 * Provides static data for dropdowns and autocompletes
 * Can be easily replaced with real API calls later
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {
  // Identity Types
  readonly identityTypes = signal<Lov[]>([
    { id: 58, name: 'תעודת זהות', code: 'ID' },
    { id: 59, name: 'דרכון', code: 'PASSPORT' },
  ]);

  // Titles
  readonly titles = signal<Lov[]>([
    { id: 1, name: 'מר', code: 'MR' },
    { id: 2, name: 'גברת', code: 'MRS' },
    { id: 3, name: 'הרב', code: 'RABBI' },
    { id: 4, name: 'ד"ר', code: 'DR' },
  ]);

  // Loan Purposes
  readonly purposes = signal<Lov[]>([
    { id: 1, name: 'שמחות', code: 'SIMCHA' },
    { id: 2, name: 'רפואה', code: 'MEDICAL' },
    { id: 3, name: 'חינוך', code: 'EDUCATION' },
    { id: 4, name: 'דיור', code: 'HOUSING' },
    { id: 5, name: 'עסק', code: 'BUSINESS' },
    { id: 6, name: 'אחר', code: 'OTHER' },
  ]);

  // Israeli Banks
  readonly banks = signal<Bank[]>([
    { id: 10, name: 'בנק לאומי', code: '10' },
    { id: 11, name: 'בנק דיסקונט', code: '11' },
    { id: 12, name: 'בנק הפועלים', code: '12' },
    { id: 13, name: 'בנק אגוד', code: '13' },
    { id: 14, name: 'בנק אוצר החייל', code: '14' },
    { id: 17, name: 'בנק מרכנתיל', code: '17' },
    { id: 20, name: 'בנק מזרחי טפחות', code: '20' },
    { id: 31, name: 'בנק הבינלאומי', code: '31' },
    { id: 46, name: 'בנק מסד', code: '46' },
    { id: 52, name: 'בנק פאגי', code: '52' },
    { id: 54, name: 'בנק ירושלים', code: '54' },
  ]);

  // Israeli Cities
  readonly cities = signal<City[]>([
    { id: 1, name: 'ירושלים' },
    { id: 2, name: 'תל אביב' },
    { id: 3, name: 'חיפה' },
    { id: 4, name: 'באר שבע' },
    { id: 5, name: 'נתניה' },
    { id: 6, name: 'אשדוד' },
    { id: 7, name: 'בני ברק' },
    { id: 8, name: 'פתח תקווה' },
    { id: 9, name: 'ראשון לציון' },
    { id: 10, name: 'חולון' },
    { id: 11, name: 'רמת גן' },
    { id: 12, name: 'אשקלון' },
    { id: 13, name: 'הרצליה' },
    { id: 14, name: 'רעננה' },
    { id: 15, name: 'כפר סבא' },
    { id: 16, name: 'בת ים' },
    { id: 17, name: 'הוד השרון' },
    { id: 18, name: 'רחובות' },
    { id: 19, name: 'לוד' },
    { id: 20, name: 'רמלה' },
    { id: 21, name: 'מודיעין עילית' },
    { id: 22, name: 'ביתר עילית' },
    { id: 23, name: 'אלעד' },
    { id: 24, name: 'נתיבות' },
    { id: 25, name: 'אופקים' },
    { id: 26, name: 'דימונה' },
    { id: 27, name: 'ערד' },
    { id: 28, name: 'קרית גת' },
    { id: 29, name: 'קרית שמונה' },
    { id: 30, name: 'צפת' },
    { id: 31, name: 'טבריה' },
    { id: 32, name: 'נצרת' },
    { id: 33, name: 'עכו' },
    { id: 34, name: 'כרמיאל' },
    { id: 35, name: 'עפולה' },
    { id: 36, name: 'יבנה' },
    { id: 37, name: 'אילת' },
    { id: 38, name: 'קרית מלאכי' },
    { id: 39, name: 'קרית ים' },
    { id: 40, name: 'קרית ביאליק' },
    { id: 41, name: 'קרית מוצקין' },
    { id: 42, name: 'קרית אתא' },
    { id: 43, name: 'מגדל העמק' },
    { id: 44, name: 'שדרות' },
    { id: 45, name: 'בית שאן' },
    { id: 46, name: 'מעלות' },
    { id: 47, name: 'נהריה' },
    { id: 48, name: 'זכרון יעקב' },
    { id: 49, name: 'גבעתיים' },
    { id: 50, name: 'קרית אונו' },
  ]);

  // Organization Details (for payment)
  readonly organization = {
    name: 'גמ"ח אוהבי חסד',
    bankName: 'בנק מזרחי (20)',
    branch: '430',
    accountNumber: '418587',
    accountHolder: 'אוהבי חסד - וזאת ליהודה',
  };

  // Get filtered cities by search term
  filterCities(searchTerm: string): City[] {
    if (!searchTerm) return this.cities();
    const term = searchTerm.toLowerCase();
    return this.cities().filter(city => 
      city.name.toLowerCase().includes(term) || 
      city.name.includes(searchTerm)
    );
  }

  // Get bank display name with code
  getBankDisplayName(bank: Bank): string {
    return `${bank.name} (${bank.code})`;
  }

  // Get identity type by ID
  getIdentityTypeById(id: number): Lov | undefined {
    return this.identityTypes().find(type => type.id === id);
  }

  // Get city by ID
  getCityById(id: number): City | undefined {
    return this.cities().find(city => city.id === id);
  }
}
