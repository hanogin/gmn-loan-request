import { isPlatformBrowser, registerLocaleData } from '@angular/common';
import { afterNextRender, computed, DOCUMENT, effect, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { BrnCalendarI18n, injectBrnCalendarI18n } from '@spartan-ng/brain/calendar';
import { englishCalendarI18n, hebrewCalendarI18n } from './date-i18n';
import { DirectionalityService } from './directionality-service';
import { LOCAL_STORAGE } from './tokens';

export const LANGUAGES = ['en', 'he'] as const;
export type Language = (typeof LANGUAGES)[number];

export interface AvailableLanguage {
  code: Language;
  label: string;
}

const registeredLocales = new Set<string>(['en']);

@Service()
export class LanguageService {
  private readonly _translocoService = inject(TranslocoService);
  private readonly _dir = inject(DirectionalityService);
  private readonly _localStorage = inject(LOCAL_STORAGE);
  private readonly _document = inject(DOCUMENT);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _calendarI18n = injectBrnCalendarI18n();

  public readonly currentLang = computed(() => this._translocoService.activeLang() as Language);

  private readonly _availableLanguages = signal<AvailableLanguage[]>([
    {
      code: 'en',
      label: 'English',
    },
    {
      code: 'he',
      label: 'עברית',
    },
  ]);
  public readonly availableLanguages = this._availableLanguages.asReadonly();

  private readonly brnCalendarI18nMap: Record<Language, Partial<BrnCalendarI18n>> = {
    en: englishCalendarI18n,
    he: hebrewCalendarI18n,
  };

  constructor() {
    // Keep <html lang> in sync with the active language (index.html hardcodes
    // "en") so screen readers pick the right speech synthesis.
    effect(() => {
      const lang = this.currentLang();
      if (isPlatformBrowser(this._platformId)) {
        this._document.documentElement.lang = lang;
      }
    });

    afterNextRender(() => {
      const browserLang = navigator.language?.split('-')[0];
      if (browserLang && browserLang === 'he') {
        this._dir.updateDirection('rtl');
      }
    });
  }

  async setLanguage(lang: Language): Promise<void> {
    this._calendarI18n.use(this.brnCalendarI18nMap[lang]);
    this._localStorage?.setItem('lang', lang);
    await this._ensureLocaleRegistered(lang);
    this._translocoService.setActiveLang(lang);
    const direction = lang === 'he' ? 'rtl' : 'ltr';
    this._dir.updateDirection(direction);
  }

  private async _ensureLocaleRegistered(lang: Language): Promise<void> {
    if (registeredLocales.has(lang)) return;

    if (lang === 'he') {
      const localeHe = (await import('@angular/common/locales/he')).default;
      registerLocaleData(localeHe, 'he');
    }

    registeredLocales.add(lang);
  }
}
