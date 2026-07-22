/**
 * I18nManager - Internationalization Manager
 * Handles loading and management of localized strings from properties files
 * Direct port of Java ResourceBundle functionality for browser environment
 */

import { PropertiesParser } from '../utils/PropertiesParser';

export class I18nManager {
  private static instance: I18nManager | null = null;
  private static readonly BASE_PATH = 'src/demos/ps/lang/Script_';
  private static readonly DEFAULT_LOCALE = 'en';

  // Cache for loaded language data
  private languageCache = new Map<string, Map<string, string>>();
  private currentLocale: string = I18nManager.DEFAULT_LOCALE;
  private isInitialized: boolean = false;

  // Supported languages based on available .properties files
  private static readonly SUPPORTED_LOCALES = ['en', 'de', 'fr', 'pt', 'se', 'tt'];

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  /**
   * Initialize I18nManager with specified locale
   */
  public async initialize(locale: string = I18nManager.DEFAULT_LOCALE): Promise<void> {
    console.log(`I18nManager: Initializing with locale ${locale}`);

    this.currentLocale = this.validateLocale(locale);

    // Load the primary language
    await this.loadLanguage(this.currentLocale);

    // Load fallback language (English) if current locale is not English
    if (this.currentLocale !== I18nManager.DEFAULT_LOCALE) {
      await this.loadLanguage(I18nManager.DEFAULT_LOCALE);
    }

    this.isInitialized = true;
    console.log(`I18nManager: Initialization complete for locale ${this.currentLocale}`);
  }

  /**
   * Validate and normalize locale string
   */
  private validateLocale(locale: string): string {
    const normalizedLocale = locale.toLowerCase();

    if (I18nManager.SUPPORTED_LOCALES.includes(normalizedLocale)) {
      return normalizedLocale;
    }

    console.warn(`I18nManager: Unsupported locale ${locale}, falling back to ${I18nManager.DEFAULT_LOCALE}`);
    return I18nManager.DEFAULT_LOCALE;
  }

  /**
   * Load language properties file
   */
  private async loadLanguage(locale: string): Promise<void> {
    // Check if already loaded
    if (this.languageCache.has(locale)) {
      console.log(`I18nManager: Language ${locale} already cached`);
      return;
    }

    try {
      const url = `${I18nManager.BASE_PATH}${locale}.properties`;
      console.log(`I18nManager: Loading language file ${url}`);

      const properties = await PropertiesParser.loadFromUrl(url);
      this.languageCache.set(locale, properties);

      console.log(`I18nManager: Loaded ${properties.size} strings for locale ${locale}`);
    } catch (error) {
      console.error(`I18nManager: Failed to load language ${locale}:`, error);

      // If we failed to load the default locale, this is a critical error
      if (locale === I18nManager.DEFAULT_LOCALE) {
        throw new Error(`Failed to load default language file for locale ${locale}`);
      }
    }
  }

  /**
   * Get localized string by key
   * Implements the original Java getString behavior with fallback
   */
  public getString(key: string): string {
    if (!this.isInitialized) {
      console.warn('I18nManager: Not initialized, returning key as fallback');
      return key;
    }

    // Try current locale first
    const currentLanguage = this.languageCache.get(this.currentLocale);
    if (currentLanguage && currentLanguage.has(key)) {
      return currentLanguage.get(key)!;
    }

    // Fallback to default locale (English) if current locale doesn't have the key
    if (this.currentLocale !== I18nManager.DEFAULT_LOCALE) {
      const fallbackLanguage = this.languageCache.get(I18nManager.DEFAULT_LOCALE);
      if (fallbackLanguage && fallbackLanguage.has(key)) {
        console.debug(`I18nManager: Using fallback locale for key: ${key}`);
        return fallbackLanguage.get(key)!;
      }
    }

    // Key not found in any language
    console.error(`I18nManager: String ${key} not found in any language`);
    return key;
  }

  /**
   * Change current locale and load new language files
   */
  public async setLocale(locale: string): Promise<void> {
    const normalizedLocale = this.validateLocale(locale);

    if (this.currentLocale === normalizedLocale) {
      console.log(`I18nManager: Already using locale ${normalizedLocale}`);
      return;
    }

    console.log(`I18nManager: Changing locale from ${this.currentLocale} to ${normalizedLocale}`);

    // Load the new language if not already cached
    if (!this.languageCache.has(normalizedLocale)) {
      await this.loadLanguage(normalizedLocale);
    }

    this.currentLocale = normalizedLocale;
  }

  /**
   * Get current locale
   */
  public getCurrentLocale(): string {
    return this.currentLocale;
  }

  /**
   * Get list of supported locales
   */
  public static getSupportedLocales(): string[] {
    return [...I18nManager.SUPPORTED_LOCALES];
  }

  /**
   * Check if a locale is supported
   */
  public static isLocaleSupported(locale: string): boolean {
    return I18nManager.SUPPORTED_LOCALES.includes(locale.toLowerCase());
  }

  /**
   * Check if a key exists in current or fallback language
   */
  public hasKey(key: string): boolean {
    if (!this.isInitialized) {
      return false;
    }

    // Check current locale
    const currentLanguage = this.languageCache.get(this.currentLocale);
    if (currentLanguage && currentLanguage.has(key)) {
      return true;
    }

    // Check fallback locale
    if (this.currentLocale !== I18nManager.DEFAULT_LOCALE) {
      const fallbackLanguage = this.languageCache.get(I18nManager.DEFAULT_LOCALE);
      if (fallbackLanguage && fallbackLanguage.has(key)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all keys for debugging purposes
   */
  public getAllKeys(): string[] {
    if (!this.isInitialized) {
      return [];
    }

    const keys = new Set<string>();

    // Collect keys from current locale
    const currentLanguage = this.languageCache.get(this.currentLocale);
    if (currentLanguage) {
      for (const key of currentLanguage.keys()) {
        keys.add(key);
      }
    }

    // Collect keys from fallback locale
    const fallbackLanguage = this.languageCache.get(I18nManager.DEFAULT_LOCALE);
    if (fallbackLanguage) {
      for (const key of fallbackLanguage.keys()) {
        keys.add(key);
      }
    }

    return Array.from(keys).sort();
  }

  /**
   * Clear language cache (useful for testing or memory management)
   */
  public clearCache(): void {
    this.languageCache.clear();
    this.isInitialized = false;
    console.log('I18nManager: Cache cleared');
  }

  /**
   * Get cache statistics for debugging
   */
  public getCacheStats(): { [locale: string]: number } {
    const stats: { [locale: string]: number } = {};

    for (const [locale, properties] of this.languageCache) {
      stats[locale] = properties.size;
    }

    return stats;
  }
}