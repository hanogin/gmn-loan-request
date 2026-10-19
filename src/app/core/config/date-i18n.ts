import { BrnCalendarI18n } from '@spartan-ng/brain/calendar';

export const englishCalendarI18n: Partial<BrnCalendarI18n> = {
  formatWeekdayName: (index: number) => {
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return weekdays[index];
  },
  months: () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  formatHeader: (month: number, year: number) => {
    return new Date(year, month).toLocaleDateString('en', {
      month: 'long',
      year: 'numeric',
    });
  },
  formatMonth: (month: number) => {
    return new Date(2000, month).toLocaleDateString('en', {
      month: 'short',
    });
  },
  formatYear: (year: number): string => {
    return new Date(year, 0).toLocaleDateString('en', {
      year: 'numeric',
    });
  },
  labelPrevious: () => 'Go to the previous month',
  labelNext: () => 'Go to the next month',
  labelWeekday: (index: number) => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays[index];
  },
  firstDayOfWeek: () => 0,
};

export const hebrewCalendarI18n: Partial<BrnCalendarI18n> = {
  formatWeekdayName: (index: number) => {
    const weekdays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
    return weekdays[index];
  },
  months: () => ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'],
  formatHeader: (month: number, year: number) => {
    return new Date(year, month).toLocaleDateString('he', {
      month: 'long',
      year: 'numeric',
    });
  },
  formatMonth: (month: number) => {
    return new Date(2000, month).toLocaleDateString('he', {
      month: 'short',
    });
  },
  formatYear: (year: number): string => {
    return new Date(year, 0).toLocaleDateString('he', {
      year: 'numeric',
    });
  },
  labelPrevious: () => 'לחודש הקודם',
  labelNext: () => 'לחודש הבא',
  labelWeekday: (index: number) => {
    const weekdays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return weekdays[index];
  },
  firstDayOfWeek: () => 0,
};
