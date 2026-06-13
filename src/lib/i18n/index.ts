import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'ar'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const STORAGE_KEY = 'marusja-cakes-locale';

// Eagerly import every locale namespace JSON: ./locales/<lang>/<namespace>.json
const modules = import.meta.glob<{ default: Record<string, unknown> }>(
  './locales/*/*.json',
  { eager: true },
);

type Table = Record<string, unknown>;
type Resources = Record<string, Record<string, Table>>;

const resources: Resources = {};
for (const [path, mod] of Object.entries(modules)) {
  const match = /\/locales\/([^/]+)\/([^/]+)\.json$/.exec(path);
  if (!match) continue;
  const [, lang, namespace] = match;
  (resources[lang] ??= {})[namespace] = mod.default;
}

export type TranslateParams = Record<string, string | number> & { count?: number };

function getInitialLanguage(): SupportedLanguage {
  if (!browser) return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
    return stored as SupportedLanguage;
  }
  const nav = navigator.language.split('-')[0];
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(nav)) {
    return nav as SupportedLanguage;
  }
  return 'en';
}

export const locale = writable<SupportedLanguage>(getInitialLanguage());

export function setLocale(code: SupportedLanguage): void {
  locale.set(code);
}

export const dir = derived(locale, ($locale): 'rtl' | 'ltr' =>
  $locale === 'ar' ? 'rtl' : 'ltr',
);

const pluralRulesCache = new Map<string, Intl.PluralRules>();
function pluralCategory(lang: string, count: number): Intl.LDMLPluralRule {
  let rules = pluralRulesCache.get(lang);
  if (!rules) {
    rules = new Intl.PluralRules(lang);
    pluralRulesCache.set(lang, rules);
  }
  return rules.select(count);
}

function resolvePath(table: Table | undefined, path: string): unknown {
  if (!table) return undefined;
  let node: unknown = table;
  for (const segment of path.split('.')) {
    if (node == null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  return node;
}

function lookup(
  lang: string,
  namespace: string,
  path: string,
  params?: TranslateParams,
): unknown {
  const table = resources[lang]?.[namespace];

  if (params && typeof params.count === 'number') {
    const cat = pluralCategory(lang, params.count);
    return (
      resolvePath(table, `${path}_${cat}`) ??
      resolvePath(table, `${path}_other`) ??
      resolvePath(table, path)
    );
  }
  return resolvePath(table, path);
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{{${name}}}`,
  );
}

export type TranslateFn = (key: string, params?: TranslateParams) => string;

function translate(lang: string, key: string, params?: TranslateParams): string {
  const colon = key.indexOf(':');
  const namespace = colon === -1 ? 'common' : key.slice(0, colon);
  const path = colon === -1 ? key : key.slice(colon + 1);

  let value = lookup(lang, namespace, path, params);
  if (value === undefined && lang !== 'en') {
    value = lookup('en', namespace, path, params);
  }
  if (typeof value !== 'string') return key;

  return interpolate(value, params);
}

/** Reactive translator: `$t('cart:added', { name })`, `$t('common:brand')`. */
export const t = derived(
  locale,
  ($locale): TranslateFn =>
    (key, params) =>
      translate($locale, key, params),
);
